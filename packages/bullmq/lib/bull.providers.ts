import {
  createConditionalDepHolder,
  getQueueToken,
  IConditionalDepHolder,
} from '@nestjs/bull-shared';
import {
  FactoryProvider,
  flatten,
  OnApplicationShutdown,
  Provider,
  Type,
} from '@nestjs/common';
import { FlowProducer, Queue, Worker } from 'bullmq';
import { BullQueueProcessor } from './bull.types';
import { RegisterFlowProducerOptions } from './interfaces';
import { RegisterQueueOptions } from './interfaces/register-queue-options.interface';
import {
  BULL_CONFIG_DEFAULT_TOKEN,
  getFlowProducerOptionsToken,
  getFlowProducerToken,
  getQueueOptionsToken,
  getSharedConfigToken,
} from './utils';
import {
  isAdvancedProcessor,
  isAdvancedSeparateProcessor,
  isProcessorCallback,
  isSeparateProcessor,
} from './utils/helpers';

async function createQueueAndWorkers<
  TQueue = Queue,
  TWorker extends Worker = Worker,
>(
  options: RegisterQueueOptions,
  queueClass: Type<TQueue>,
  workerClass: Type<TWorker>,
): Promise<TQueue> {
  const queueName = options.name ?? 'default';
  const queue: TQueue = new queueClass(queueName, options);
  if (
    options.globalConcurrency >= 0 &&
    typeof (queue as Queue).setGlobalConcurrency === 'function'
  ) {
    (queue as Queue).setGlobalConcurrency(options.globalConcurrency);
  }

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
      await this.close();

      if (options.forceDisconnectOnShutdown) {
        if (this.connection?.status !== 'closed' && this.disconnect) {
          return this.disconnect();
        }
      }
    };
  return queue;
}

function createFlowProducers<TFlowProducer = FlowProducer>(
  options: RegisterFlowProducerOptions,
  flowProducerClass: Type<TFlowProducer>,
): TFlowProducer {
  const flowProducer = new flowProducerClass(options);

  (flowProducer as unknown as OnApplicationShutdown).onApplicationShutdown =
    async function (this: FlowProducer) {
      await this.close();

      if (this.disconnect) {
        return this.disconnect();
      }
    };
  return flowProducer;
}

export function createQueueOptionProviders(
  options: RegisterQueueOptions[],
): Provider[] {
  const providers = options.map((option) => {
    const optionalSharedConfigHolder = createConditionalDepHolder(
      getSharedConfigToken(option.configKey),
      BULL_CONFIG_DEFAULT_TOKEN,
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

export function createFlowProducerOptionProviders(
  options: RegisterFlowProducerOptions[],
): Provider[] {
  const providers = options.map((option) => {
    const optionalSharedConfigHolder = createConditionalDepHolder(
      getSharedConfigToken(option.configKey),
      BULL_CONFIG_DEFAULT_TOKEN,
    );
    return [
      optionalSharedConfigHolder,
      {
        provide: getFlowProducerOptionsToken(option.name),
        useFactory: (
          optionalDepHolder: IConditionalDepHolder<FlowProducer>,
        ) => {
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
  const queueProviders = options.map(
    (item): FactoryProvider => ({
      provide: getQueueToken(item.name),
      useFactory: async (queueOptions: RegisterQueueOptions) => {
        const queueName = queueOptions.name || item.name;
        return await createQueueAndWorkers(
          { ...queueOptions, name: queueName },
          queueClass,
          workerClass,
        );
      },
      inject: [getQueueOptionsToken(item.name)],
    }),
  );
  return queueProviders;
}

export function createFlowProducerProviders<TFlowProducer = FlowProducer>(
  options: RegisterFlowProducerOptions[],
  flowProducerClass: Type<TFlowProducer>,
): Provider[] {
  const flowProducerProviders = options.map((item) => ({
    provide: getFlowProducerToken(item.name),
    useFactory: (flowProducerOptions: RegisterFlowProducerOptions) => {
      const flowProducerName = flowProducerOptions.name || item.name;
      return createFlowProducers(
        { ...flowProducerOptions, name: flowProducerName },
        flowProducerClass,
      );
    },
    inject: [getFlowProducerOptionsToken(item.name)],
  }));
  return flowProducerProviders;
}
