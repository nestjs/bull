import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, ModuleRef } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { Job, ProcessCallbackFunction, Queue } from 'bull';
import { BullMetadataAccessor } from './bull-metadata.accessor';
import { NO_QUEUE_FOUND } from './bull.messages';
import { BullQueueEventOptions } from './bull.types';
import { ProcessOptions } from './decorators';
import { getQueueToken } from './utils';

@Injectable()
export class BullExplorer implements OnModuleInit {
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataAccessor: BullMetadataAccessor,
    private readonly metadataScanner: MetadataScanner,
    private readonly logger: Logger,
  ) {}

  onModuleInit() {
    this.explore();
  }

  explore() {
    const providers: InstanceWrapper[] = this.discoveryService
      .getProviders()
      .filter((wrapper: InstanceWrapper) =>
        this.metadataAccessor.isQueueComponent(wrapper.metatype),
      );

    providers.forEach((wrapper: InstanceWrapper) => {
      const { instance, metatype } = wrapper;
      const queueName = this.metadataAccessor.getQueueComponentMetadata(
        metatype,
      ).name;

      const queueToken = getQueueToken(queueName);
      const bullQueue = this.getQueue(queueToken, queueName);

      this.metadataScanner.scanFromPrototype(
        instance,
        Object.getPrototypeOf(instance),
        (key: string) => {
          if (this.metadataAccessor.isProcessor(instance[key])) {
            const metadata = this.metadataAccessor.getProcessMetadata(
              instance[key],
            );
            this.handleProcessor(instance, key, bullQueue, metadata);
          } else if (this.metadataAccessor.isListener(instance[key])) {
            const metadata = this.metadataAccessor.getListenerMetadata(
              instance[key],
            );
            this.handleListener(instance, key, bullQueue, metadata);
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
    options?: ProcessOptions,
  ) {
    let args = [
      options && options.name,
      options && options.concurrency,
      instance[key].bind(instance) as ProcessCallbackFunction<unknown>,
    ];
    args = args.filter(item => item !== undefined);
    queue.process.call(queue, ...args);
  }

  handleListener(
    instance: object,
    key: string,
    queue: Queue,
    options: BullQueueEventOptions,
  ) {
    if (options.name || options.id) {
      queue.on(
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
      queue.on(options.eventName, instance[key].bind(instance));
    }
  }
}
