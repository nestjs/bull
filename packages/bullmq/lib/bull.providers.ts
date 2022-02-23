import {
  createConditionalDepHolder,
  getQueueOptionsToken,
  getQueueToken,
  getSharedConfigToken,
  IConditionalDepHolder,
} from '@nestjs/bull-shared';
import { flatten, OnApplicationShutdown, Provider, Type } from '@nestjs/common';
import { Queue, QueueScheduler, Worker } from 'bullmq';
import { BullQueueProcessor } from './bull.types';
import { RegisterQueueOptions } from './interfaces/register-queue-options.interface';
import { getQueueSchedulerToken } from './utils/get-queue-scheduler-token.util';
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
  const queueProviders = options.map((item) => ({
    provide: getQueueToken(item.name),
    useFactory: (queueOptions: RegisterQueueOptions) => {
      const queueName = queueOptions.name || item.name;
      return createQueueAndWorkers(
        { ...queueOptions, name: queueName },
        queueClass,
        workerClass,
      );
    },
    inject: [getQueueOptionsToken(item.name)],
  }));
  return queueProviders;
}

export function createQueueSchedulerProviders(
  options: RegisterQueueOptions[],
): Provider[] {
  const queueSchedulerProviders = options.map((item) => ({
    provide: getQueueSchedulerToken(item.name),
    useFactory: (queueOptions: RegisterQueueOptions) => {
      const queueName = queueOptions.name || item.name;
      const queueScheduler = new QueueScheduler(queueName, queueOptions);
      (
        queueScheduler as unknown as OnApplicationShutdown
      ).onApplicationShutdown = async function (this: QueueScheduler) {
        return this.close();
      };
      return queueScheduler;
    },
    inject: [getQueueOptionsToken(item.name)],
  }));

  return queueSchedulerProviders;
}
