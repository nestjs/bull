import * as Bull from 'bull';
import { Queue } from 'bull';
import {
  BullModuleOptions,
  BullModuleAsyncOptions,
  BullOptionsFactory,
} from './bull.interfaces';
import { BullQueueProcessor, isAdvancedProcessor } from './bull.types';
import { getQueueToken } from './bull.utils';
import { Provider } from '@nestjs/common';

function buildQueue(option: BullModuleOptions): Queue {
  const queue: Queue = new Bull(
    option.name ? option.name : 'default',
    option.options,
  );
  if (option.processors) {
    option.processors.forEach((processor: BullQueueProcessor) => {
      if (isAdvancedProcessor(processor)) {
        const hasName = !!processor.name;
        const hasConcurrency = !!processor.concurrency;
        hasName && hasConcurrency
          ? queue.process(
              processor.name,
              processor.concurrency,
              processor.callback,
            )
          : hasName
          ? queue.process(processor.name, processor.callback)
          : queue.process(processor.concurrency, processor.callback);
      } else {
        queue.process(processor);
      }
    });
  }
  return queue;
}

export function createQueuesProviders(options: BullModuleOptions[]): any {
  const configs = [];
  const queues = [];
  for (const option of options) {
    const config = {
      provide: `${getQueueToken(option.name)}_CONFIG`,
      useValue: option
    };
    const factory = {
      provide: getQueueToken(option.name),
      useFactory: (o) => {
        return buildQueue(o);
      },
      inject: [ `${getQueueToken(option.name)}_CONFIG` ]
    };
    configs.push(config);
    queues.push(factory);
  }
  return { configs, queues };
}

export function createAsyncQueuesProviders(
  options: BullModuleAsyncOptions[],
): Provider[] {
  const classProviders: Provider[] = [];
  return options
    .map(
      (option: BullModuleAsyncOptions): Provider => {
        if (option.useFactory) {
          return {
            provide: getQueueToken(option.name),
            useFactory: async (...args: any[]) =>
              buildQueue(await option.useFactory(...args)),
            inject: option.inject || [],
          };
        }
        if (option.useClass) {
          classProviders.push({
            provide: option.useClass,
            useClass: option.useClass,
          });
        }
        return {
          provide: getQueueToken(option.name),
          useFactory: async (optionFactory: BullOptionsFactory) =>
            buildQueue(await optionFactory.createBullOptions()),
          inject: [option.useClass || option.useExisting],
        };
      },
    )
    .concat(classProviders);
}
