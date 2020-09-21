import { flatten, OnApplicationShutdown, Provider } from '@nestjs/common';
import * as Bull from 'bull';
import { Queue } from 'bull';
import { BullQueueProcessor } from './bull.types';
import { createConditionalDepHolder, IConditionalDepHolder } from './helpers';
import { BullModuleOptions } from './interfaces/bull-module-options.interface';
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

function buildQueue(option: BullModuleOptions): Queue {
  const queue: Queue = new Bull(option.name ? option.name : 'default', option);
  if (option.processors) {
    option.processors.forEach((processor: BullQueueProcessor) => {
      let args = [];
      if (isAdvancedProcessor(processor)) {
        args.push(processor.name, processor.concurrency, processor.callback);
      } else if (isAdvancedSeparateProcessor(processor)) {
        args.push(processor.name, processor.concurrency, processor.path);
      } else if (isSeparateProcessor(processor)) {
        args.push(processor);
      } else if (isProcessorCallback(processor)) {
        args.push(processor);
      }
      args = args.filter(arg => !!arg);
      queue.process.call(queue, ...args);
    });
  }
  ((queue as unknown) as OnApplicationShutdown).onApplicationShutdown = function(
    this: Queue,
  ) {
    return this.close();
  };
  return queue;
}

export function createQueueOptionProviders(
  options: BullModuleOptions[],
): Provider[] {
  const providers = options.map(option => {
    const optionalSharedConfigHolder = createConditionalDepHolder(
      getSharedConfigToken(option.configKey),
    );
    return [
      optionalSharedConfigHolder,
      {
        provide: getQueueOptionsToken(option.name),
        useFactory: (optionalDepHolder: IConditionalDepHolder<Bull.Queue>) => {
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

export function createQueueProviders(options: BullModuleOptions[]): Provider[] {
  return options.map(option => ({
    provide: getQueueToken(option.name),
    useFactory: (o: BullModuleOptions) => {
      const queueName = o.name || option.name;
      return buildQueue({ ...o, name: queueName });
    },
    inject: [getQueueOptionsToken(option.name)],
  }));
}
