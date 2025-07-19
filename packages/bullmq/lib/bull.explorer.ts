import { getQueueToken, NO_QUEUE_FOUND } from '@nestjs/bull-shared';
import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  Type,
} from '@nestjs/common';
import {
  ContextIdFactory,
  DiscoveryService,
  MetadataScanner,
  ModuleRef,
} from '@nestjs/core';
import { Injector } from '@nestjs/core/injector/injector';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';
import { REQUEST_CONTEXT_ID } from '@nestjs/core/router/request/request-constants';
import {
  FlowOpts,
  FlowProducer,
  Processor,
  Queue,
  QueueEvents,
  Worker,
} from 'bullmq';
import { BullMetadataAccessor } from './bull-metadata.accessor';
import { NO_FLOW_PRODUCER_FOUND } from './bull.messages';
import { OnQueueEventMetadata, OnWorkerEventMetadata } from './decorators';
import {
  InvalidProcessorClassError,
  InvalidQueueEventsListenerClassError,
} from './errors';
import { QueueEventsHost, WorkerHost } from './hosts';
import { NestQueueOptions } from './interfaces/queue-options.interface';
import { NestWorkerOptions } from './interfaces/worker-options.interface';
import { getSharedConfigToken } from './utils/get-shared-config-token.util';

@Injectable()
export class BullExplorer implements OnApplicationShutdown {
  private static _workerClass: Type = Worker;
  private readonly logger = new Logger('BullModule');
  private readonly injector = new Injector();
  private readonly workers: Worker[] = [];

  static set workerClass(cls: Type) {
    this._workerClass = cls;
  }

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataAccessor: BullMetadataAccessor,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  onApplicationShutdown(signal?: string) {
    return Promise.all(this.workers.map((worker) => worker.close()));
  }

  register() {
    this.registerWorkers();
    this.registerQueueEventListeners();
  }

  registerWorkers() {
    const processors: InstanceWrapper[] = this.discoveryService
      .getProviders()
      .filter((wrapper: InstanceWrapper) =>
        this.metadataAccessor.isProcessor(
          // NOTE: Regarding the ternary statement below,
          // - The condition `!wrapper.metatype` is because when we use `useValue`
          // the value of `wrapper.metatype` will be `null`.
          // - The condition `wrapper.inject` is needed here because when we use
          // `useFactory`, the value of `wrapper.metatype` will be the supplied
          // factory function.
          // For both cases, we should use `wrapper.instance.constructor` instead
          // of `wrapper.metatype` to resolve processor's class properly.
          // But since calling `wrapper.instance` could degrade overall performance
          // we must defer it as much we can. But there's no other way to grab the
          // right class that could be annotated with `@Processor()` decorator
          // without using this property.
          !wrapper.metatype || wrapper.inject
            ? wrapper.instance?.constructor
            : wrapper.metatype,
        ),
      );

    processors.forEach((wrapper: InstanceWrapper) => {
      const { instance, metatype } = wrapper;
      const isRequestScoped = !wrapper.isDependencyTreeStatic();
      const { name: queueName, configKey } =
        this.metadataAccessor.getProcessorMetadata(
          // NOTE: We are relying on `instance.constructor` to properly support
          // `useValue` and `useFactory` providers besides `useClass`.
          instance.constructor || metatype,
        );

      const queueToken = getQueueToken(queueName);
      const queueOpts = this.getQueueOptions(queueToken, queueName, configKey);

      if (!(instance instanceof WorkerHost)) {
        throw new InvalidProcessorClassError(instance.constructor?.name);
      } else {
        const workerOptions = this.metadataAccessor.getWorkerOptionsMetadata(
          instance.constructor,
        );
        this.handleProcessor(
          instance,
          queueName,
          queueOpts,
          wrapper.host,
          isRequestScoped,
          workerOptions,
        );
      }

      this.registerWorkerEventListeners(wrapper);
    });
  }

  getQueueOptions(queueToken: string, queueName: string, configKey?: string) {
    try {
      const queueRef = this.moduleRef.get<Queue>(queueToken, { strict: false });
      return (queueRef.opts ?? {}) as NestQueueOptions;
    } catch (err) {
      const sharedConfigToken = getSharedConfigToken(configKey);
      try {
        return this.moduleRef.get<NestQueueOptions>(sharedConfigToken, {
          strict: false,
        });
      } catch (err) {
        this.logger.error(NO_QUEUE_FOUND(queueName));
        throw err;
      }
    }
  }

  getFlowProducerOptions(
    flowProducerToken: string,
    name: string,
    configKey?: string,
  ) {
    try {
      const flowProducerRef = this.moduleRef.get<FlowProducer>(
        flowProducerToken,
        { strict: false },
      );
      return flowProducerRef.opts ?? {};
    } catch (err) {
      const sharedConfigToken = getSharedConfigToken(configKey);
      try {
        return this.moduleRef.get<FlowOpts>(sharedConfigToken, {
          strict: false,
        });
      } catch (err) {
        this.logger.error(NO_FLOW_PRODUCER_FOUND(name));
        throw err;
      }
    }
  }

  handleProcessor<T extends WorkerHost>(
    instance: T,
    queueName: string,
    queueOpts: NestQueueOptions,
    moduleRef: Module,
    isRequestScoped: boolean,
    options: NestWorkerOptions = {},
  ) {
    const methodKey = 'process';
    let processor: Processor<any, void, string>;

    if (isRequestScoped) {
      processor = async (...args: unknown[]) => {
        const jobRef = args[0];
        const contextId = ContextIdFactory.getByRequest(jobRef);

        if (
          this.moduleRef.registerRequestByContextId &&
          !contextId[REQUEST_CONTEXT_ID]
        ) {
          // Additional condition to prevent breaking changes in
          // applications that use @nestjs/bull older than v7.4.0.
          this.moduleRef.registerRequestByContextId(jobRef, contextId);
        }

        const contextInstance = await this.injector.loadPerContext(
          instance,
          moduleRef,
          moduleRef.providers,
          contextId,
        );
        return contextInstance[methodKey].call(contextInstance, ...args);
      };
    } else {
      processor = instance[methodKey].bind(instance);
    }
    const worker = new BullExplorer._workerClass(queueName, processor, {
      connection: queueOpts.connection,
      sharedConnection: queueOpts.sharedConnection,
      prefix: queueOpts.prefix,
      telemetry: queueOpts.telemetry,
      ...options,
    });
    (instance as any)._worker = worker;

    this.workers.push(worker);
  }

  registerWorkerEventListeners(wrapper: InstanceWrapper) {
    const { instance } = wrapper;

    this.metadataScanner.scanFromPrototype(
      instance,
      Object.getPrototypeOf(instance),
      (key: string) => {
        const workerEventHandlerMetadata =
          this.metadataAccessor.getOnWorkerEventMetadata(instance[key]);
        if (workerEventHandlerMetadata) {
          this.handleWorkerEvents(key, wrapper, workerEventHandlerMetadata);
        }
      },
    );
  }

  handleWorkerEvents(
    key: string,
    wrapper: InstanceWrapper,
    options: OnWorkerEventMetadata,
  ) {
    const { instance } = wrapper;

    if (!wrapper.isDependencyTreeStatic()) {
      this.logger.warn(
        `Warning! "${wrapper.name}" class is request-scoped and it defines an event listener ("${wrapper.name}#${key}"). Since event listeners cannot be registered on scoped providers, this handler will be ignored.`,
      );
      return;
    }
    instance.worker.on(options.eventName, instance[key].bind(instance));
  }

  registerQueueEventListeners() {
    const eventListeners: InstanceWrapper[] = this.discoveryService
      .getProviders()
      .filter((wrapper: InstanceWrapper) =>
        this.metadataAccessor.isQueueEventsListener(
          // NOTE: Regarding the ternary statement below,
          // - The condition `!wrapper.metatype` is because when we use `useValue`
          // the value of `wrapper.metatype` will be `null`.
          // - The condition `wrapper.inject` is needed here because when we use
          // `useFactory`, the value of `wrapper.metatype` will be the supplied
          // factory function.
          // For both cases, we should use `wrapper.instance.constructor` instead
          // of `wrapper.metatype` to resolve processor's class properly.
          // But since calling `wrapper.instance` could degrade overall performance
          // we must defer it as much we can. But there's no other way to grab the
          // right class that could be annotated with `@Processor()` decorator
          // without using this property.
          !wrapper.metatype || wrapper.inject
            ? wrapper.instance?.constructor
            : wrapper.metatype,
        ),
      );

    eventListeners.forEach((wrapper: InstanceWrapper) => {
      const { instance, metatype } = wrapper;
      if (!wrapper.isDependencyTreeStatic()) {
        this.logger.warn(
          `Warning! "${wrapper.name}" class is request-scoped and it is flagged as an event listener. Since event listeners cannot be registered on scoped providers, this handler will be ignored.`,
        );
        return;
      }

      const { queueName, queueEventsOptions } =
        this.metadataAccessor.getQueueEventsListenerMetadata(
          // NOTE: We are relying on `instance.constructor` to properly support
          // `useValue` and `useFactory` providers besides `useClass`.
          instance.constructor || metatype,
        );

      const queueToken = getQueueToken(queueName);
      const queueOpts = this.getQueueOptions(queueToken, queueName);

      if (!(instance instanceof QueueEventsHost)) {
        throw new InvalidQueueEventsListenerClassError(
          instance.constructor?.name,
        );
      } else {
        const queueEventsInstance = new QueueEvents(queueName, {
          connection: queueOpts.connection,
          prefix: queueOpts.prefix,
          sharedConnection: queueOpts.sharedConnection,
          telemetry: queueOpts.telemetry,
          ...queueEventsOptions,
        });
        (instance as any)._queueEvents = queueEventsInstance;

        this.metadataScanner.scanFromPrototype(
          instance,
          Object.getPrototypeOf(instance),
          (key: string) => {
            const queueEventHandlerMetadata =
              this.metadataAccessor.getOnQueueEventMetadata(instance[key]);
            if (queueEventHandlerMetadata) {
              this.handleQueueEvents(
                key,
                wrapper,
                queueEventsInstance,
                queueEventHandlerMetadata,
              );
            }
          },
        );
      }
    });
  }

  handleQueueEvents(
    key: string,
    wrapper: InstanceWrapper,
    queueEventsInstance: QueueEvents,
    options: OnQueueEventMetadata,
  ) {
    const { eventName } = options;
    const { instance } = wrapper;

    queueEventsInstance.on(eventName, instance[key].bind(instance));
  }
}
