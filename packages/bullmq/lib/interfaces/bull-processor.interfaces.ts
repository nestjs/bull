import {
  BullQueueProcessorCallback,
  BullQueueSeparateProcessor,
} from '../bull.types';

export interface BullQueueAdvancedProcessor {
  concurrency?: number;
  callback: BullQueueProcessorCallback;
}

export interface BullQueueAdvancedSeparateProcessor {
  concurrency?: number;
  path: BullQueueSeparateProcessor;
  useWorkerThreads?: boolean;
}
