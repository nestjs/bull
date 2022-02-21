import {
  BullQueueProcessorCallback,
  BullQueueSeparateProcessor,
} from '../bull.types';

export interface BullQueueAdvancedProcessor {
  concurrency?: number;
  name?: string;
  callback: BullQueueProcessorCallback;
}

export interface BullQueueAdvancedSeparateProcessor {
  concurrency?: number;
  name?: string;
  path: BullQueueSeparateProcessor;
}
