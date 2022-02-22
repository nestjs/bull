import { getQueueToken, NO_QUEUE_FOUND } from '@nestjs/bull-internal';
import { Injectable, Logger, OnModuleInit, Type } from '@nestjs/common';
import {
  createContextId,
  DiscoveryService,
  MetadataScanner,
  ModuleRef,
} from '@nestjs/core';
import { Injector } from '@nestjs/core/injector/injector';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';
import { Processor, Queue, QueueEvents, Worker, WorkerOptions } from 'bullmq';
import { OnQueueEventMetadata, OnWorkerEventMetadata } from '.';
import { BullMetadataAccessor } from './bull-metadata.accessor';
import {
  InvalidProcessorClassError,
  InvalidQueueEventsListenerClassError,
} from './errors';
import { QueueEventsHost, WorkerHost } from './hosts';

@Injectable()
export class BullExplorer implements OnModuleInit {
  private static _workerClass: Type = Worker;
  private readonly logger = new Logger('BullModule');
  private readonly injector = new Injector();

  static set workerClass(cls: Type) {
    this._workerClass = cls;
  }

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataAccessor: BullMetadataAccessor,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  onModuleInit() {
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
      const { name: queueName } = this.metadataAccessor.getProcessorMetadata(
        // NOTE: We are relying on `instance.constructor` to properly support
        // `useValue` and `useFactory` providers besides `useClass`.
        instance.constructor || metatype,
      );

      const queueToken = getQueueToken(queueName);
      const bullQueue = this.getQueue(queueToken, queueName);

      if (!(instance instanceof WorkerHost)) {
        throw new InvalidProcessorClassError(instance.constructor?.name);
      } else {
        const workerOptions = this.metadataAccessor.getWorkerOptionsMetadata(
          instance.constructor,
        );
        this.handleProcessor(
          instance,
          bullQueue,
          wrapper.host,
          isRequestScoped,
          workerOptions,
        );
      }

      this.registerWorkerEventListeners(wrapper);
    });
  }

  getQueue(queueToken: string, queueName: string): Queue {
    try {
      return this.moduleRef.get<Queue>(queueToken, { strict: false });
    } catch (err) {
      this.logger.error(NO_QUEUE_FOUND(queueName));
      throw err;
    }
  }

  handleProcessor<T extends WorkerHost>(
    instance: T,
    queue: Queue,
    moduleRef: Module,
    isRequestScoped: boolean,
    options: WorkerOptions = {},
  ) {
    const methodKey = 'process';
    let processor: Processor<any, void, string>;

    if (isRequestScoped) {
      processor = async (...args: unknown[]) => {
        const contextId = createContextId();

        if (this.moduleRef.registerRequestByContextId) {
          // Additional condition to prevent breaking changes in
          // applications that use @nestjs/bull older than v7.4.0.
          const jobRef = args[0];
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
    const worker = new BullExplorer._workerClass(queue.name, processor, {
      connection: queue.opts?.connection,
      sharedConnection: queue.opts?.sharedConnection,
      prefix: queue.opts?.prefix,
      ...options,
    });
    (instance as any)._worker = worker;
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
      const bullQueue = this.getQueue(queueToken, queueName);

      if (!(instance instanceof QueueEventsHost)) {
        throw new InvalidQueueEventsListenerClassError(
          instance.constructor?.name,
        );
      } else {
        const queueEventsInstance = new QueueEvents(queueName, {
          connection: bullQueue.opts.connection,
          prefix: bullQueue.opts.prefix,
          sharedConnection: bullQueue.opts.sharedConnection,
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
