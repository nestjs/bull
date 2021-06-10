import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createContextId, DiscoveryService, ModuleRef } from '@nestjs/core';
import { Injector } from '@nestjs/core/injector/injector';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { Job, Processor, Queue, Worker, QueueEvents } from 'bullmq';
import { BullMetadataAccessor } from './bull-metadata.accessor';
import { NO_QUEUE_FOUND } from './bull.messages';
import { BullQueueEventOptions } from './bull.types';
import { ProcessOptions } from './decorators';
import { getQueueToken } from './utils';

@Injectable()
export class BullExplorer implements OnModuleInit {
  private readonly logger = new Logger('BullModule');
  private readonly injector = new Injector();

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataAccessor: BullMetadataAccessor,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  onModuleInit() {
    this.explore();
  }

  explore() {
    const workers: Record<string, Worker> = {}
    const queueEvents: Record<string, QueueEvents> = {}
    const providers: InstanceWrapper[] = this.discoveryService
      .getProviders()
      .filter((wrapper: InstanceWrapper) =>
        this.metadataAccessor.isQueueComponent(wrapper.metatype),
      );

    providers.forEach((wrapper: InstanceWrapper) => {
      const { instance, metatype } = wrapper;
      const isRequestScoped = !wrapper.isDependencyTreeStatic();
      const {
        name: queueName,
      } = this.metadataAccessor.getQueueComponentMetadata(metatype);

      const queueToken = getQueueToken(queueName);
      const bullQueue = this.getQueue(queueToken, queueName);

      /**
       * TODO: BullMQ splits work into queues/workers. In order to handle
       * events we need to put the listener on the worker and not the queue.
       * The iteration below first grabs all processors and creates workers.
       * We want to ensure that all workers are created before we attempt to
       * attach any listener functions to them.
       * The second iteration through providers attaches event listeners for
       * each worker. There's probably a better way to do this.
       */
      // First iteration: create all provider workers
      this.metadataScanner.scanFromPrototype(
        instance,
        Object.getPrototypeOf(instance),
        (key: string) => {
          if (this.metadataAccessor.isProcessor(instance[key])) {
            const metadata = this.metadataAccessor.getProcessMetadata(
              instance[key],
            );
            workers[`${bullQueue.name}:::${metadata.name || '*'}`] = this.handleProcessor(
              instance,
              key,
              bullQueue,
              wrapper.host,
              isRequestScoped,
              metadata,
            );
          } else if (this.metadataAccessor.isGlobalListener(instance[key])) {
            const metadata = this.metadataAccessor.getGlobalListenerMetadata(
              instance[key],
            );
            const keyName = `${bullQueue.name}:::${metadata.name || '*'}`;

            // Only create one instance of queue events
            if ( !(keyName in queueEvents) ) {
              queueEvents[`${bullQueue.name}:::${metadata.name || '*'}`] = new QueueEvents(bullQueue.name, bullQueue.opts)
            }
          }
        },
      );

      // Second iteration: attach listener functions to workers created above.
      this.metadataScanner.scanFromPrototype(
        instance,
        Object.getPrototypeOf(instance),
        (key: string) => {
          if (this.metadataAccessor.isListener(instance[key])) {
            const metadata = this.metadataAccessor.getListenerMetadata(
              instance[key],
            );
            this.handleListener(instance, key, wrapper, bullQueue, workers[`${bullQueue.name}:::${metadata.name || '*'}`], metadata);
          } else if (this.metadataAccessor.isGlobalListener(instance[key])) {
            const metadata = this.metadataAccessor.getGlobalListenerMetadata(
              instance[key],
            );
            this.handleListener(instance, key, wrapper, bullQueue, queueEvents[`${bullQueue.name}:::${metadata.name || '*'}`], metadata);
          }
        },
      );
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

  handleProcessor(
    instance: object,
    key: string,
    queue: Queue,
    moduleRef: Module,
    isRequestScoped: boolean,
    options: ProcessOptions = {},
  ) {
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
        return contextInstance[key].call(contextInstance, ...args);
      };
    } else {
      processor = instance[key].bind(instance);
    }

    return new Worker(queue.name, processor, Object.assign(queue.opts || {}, options));
  }

  handleListener(
    instance: object,
    key: string,
    wrapper: InstanceWrapper,
    queue: Queue,
    listener: Worker | QueueEvents,
    options: BullQueueEventOptions,
  ) {
    if (!wrapper.isDependencyTreeStatic()) {
      this.logger.warn(
        `Warning! "${wrapper.name}" class is request-scoped and it defines an event listener ("${wrapper.name}#${key}"). Since event listeners cannot be registered on scoped providers, this handler will be ignored.`,
      );
      return;
    }
    if (options.name || options.id) {
      listener.on(
        options.eventName,
        async (jobOrJobId: Job | string, ...args: unknown[]) => {
          const job =
            typeof jobOrJobId === 'string'
              ? (await queue.getJob(jobOrJobId)) || { name: false, id: false }
              : jobOrJobId;

          if (job.name === options.name || job.id === options.id) {
            return instance[key].apply(instance, [job, ...args]);
          }
        },
      );
    } else {
      listener.on(options.eventName, instance[key].bind(instance));
    }
  }
}
