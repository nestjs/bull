import * as Bull from 'bull';
import { Queue } from 'bull';
import { BullModuleOptions, BullModuleAsyncOptions } from './bull.interfaces';
import {
  BullQueueProcessor,
  isAdvancedProcessor,
  isAdvancedSeparateProcessor,
  isSeparateProcessor,
  isProcessorCallback,
} from './bull.types';
import { getQueueToken, getQueueOptionsToken } from './bull.utils';
import { Provider } from '@nestjs/common';

// TODO Reduce complexity
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
      } else if (isAdvancedSeparateProcessor(processor)) {
        const hasName = !!processor.name;
        const hasConcurrency = !!processor.concurrency;
        hasName && hasConcurrency
          ? queue.process(processor.name, processor.concurrency, processor.path)
          : hasName
          ? queue.process(processor.name, processor.path)
          : queue.process(processor.concurrency, processor.path);
      } else if (isSeparateProcessor(processor)) {
        queue.process(processor);
      } else if (isProcessorCallback(processor)) {
        queue.process(processor);
      }
    });
  }
  return queue;
}

export function createQueueOptionProviders(options: BullModuleOptions[]): any {
  return options.map(option => ({
    provide: getQueueOptionsToken(option.name),
    useValue: option,
  }));
}

export function createQueueProviders(options: BullModuleOptions[]): any {
  return options.map(option => ({
    provide: getQueueToken(option.name),
    useFactory: o => buildQueue(o),
    inject: [getQueueOptionsToken(option.name)],
  }));
}

export function createAsyncQueueOptionsProviders(
  options: BullModuleAsyncOptions[],
): Provider[] {
  return options.map(option => ({
    provide: getQueueOptionsToken(option.name),
    useFactory: option.useFactory,
    useClass: option.useClass,
    useExisting: option.useExisting,
    inject: option.inject,
  }));
}
