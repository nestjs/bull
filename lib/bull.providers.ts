import { OnModuleDestroy, Provider } from '@nestjs/common';
import * as Bull from 'bull';
import { Queue } from 'bull';
import { BullQueueProcessor } from './bull.types';
import {
  BullModuleAsyncOptions,
  BullModuleOptions,
} from './interfaces/bull-module-options.interface';
import { getQueueOptionsToken, getQueueToken } from './utils';
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
  ((queue as unknown) as OnModuleDestroy).onModuleDestroy = function(
    this: Queue,
  ) {
    return this.close();
  };
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
    useFactory: (o: BullModuleOptions) => buildQueue(o),
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
