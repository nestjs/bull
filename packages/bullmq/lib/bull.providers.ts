import { flatten, OnApplicationShutdown, Provider, Type } from '@nestjs/common';
import { Queue, Worker } from 'bullmq';
import { BullQueueProcessor } from './bull.types';
import { createConditionalDepHolder, IConditionalDepHolder } from './helpers';
import { RegisterQueueOptions } from './interfaces/register-queue-options.interface';
import {
  getQueueOptionsToken,
  getQueueToken,
  getSharedConfigToken,
} from './utils';
import {
  isAdvancedProcessor,
  isAdvancedSeparateProcessor,
  isProcessorCallback,
  isSeparateProcessor,
} from './utils/helpers';

function createQueueAndWorkers<TQueue = Queue, TWorker extends Worker = Worker>(
  options: RegisterQueueOptions,
  queueClass: Type<TQueue>,
  workerClass: Type<TWorker>,
): TQueue {
  const queueName = options.name ?? 'default';
  const queue = new queueClass(queueName, options);

  let workerRefs: TWorker[] = [];
  if (options.processors) {
    workerRefs = options.processors.map((processor: BullQueueProcessor) => {
      if (isAdvancedProcessor(processor)) {
        const { callback, ...processorOptions } = processor;
        return new workerClass(queueName, callback, {
          connection: options.connection,
          sharedConnection: options.sharedConnection,
          prefix: options.prefix,
          ...processorOptions,
        });
      } else if (isAdvancedSeparateProcessor(processor)) {
        const { path, ...processorOptions } = processor;
        return new workerClass(queueName, path, {
          connection: options.connection,
          sharedConnection: options.sharedConnection,
          prefix: options.prefix,
          ...processorOptions,
        });
      } else if (isSeparateProcessor(processor)) {
        return new workerClass(queueName, processor, {
          connection: options.connection,
          sharedConnection: options.sharedConnection,
          prefix: options.prefix,
        });
      } else if (isProcessorCallback(processor)) {
        return new workerClass(queueName, processor, {
          connection: options.connection,
          sharedConnection: options.sharedConnection,
          prefix: options.prefix,
        });
      }
    });
  }
  (queue as unknown as OnApplicationShutdown).onApplicationShutdown =
    async function (this: Queue) {
      const closeWorkers = workerRefs.map((worker) => worker.close());
      await Promise.all(closeWorkers);
      return this.close();
    };
  return queue;
}

export function createQueueOptionProviders(
  options: RegisterQueueOptions[],
): Provider[] {
  const providers = options.map((option) => {
    const optionalSharedConfigHolder = createConditionalDepHolder(
      getSharedConfigToken(option.configKey),
    );
    return [
      optionalSharedConfigHolder,
      {
        provide: getQueueOptionsToken(option.name),
        useFactory: (optionalDepHolder: IConditionalDepHolder<Queue>) => {
          return {
            ...optionalDepHolder.getDependencyRef(option.name),
            ...option,
          };
        },
        inject: [optionalSharedConfigHolder],
      },
    ];
  });
  return flatten(providers);
}

export function createQueueProviders<
  TQueue = Queue,
  TWorker extends Worker = Worker,
>(
  options: RegisterQueueOptions[],
  queueClass: Type<TQueue>,
  workerClass: Type<TWorker>,
): Provider[] {
  return options.map((option) => ({
    provide: getQueueToken(option.name),
    useFactory: (o: RegisterQueueOptions) => {
      const queueName = o.name || option.name;
      return createQueueAndWorkers(
        { ...o, name: queueName },
        queueClass,
        workerClass,
      );
    },
    inject: [getQueueOptionsToken(option.name)],
  }));
}
