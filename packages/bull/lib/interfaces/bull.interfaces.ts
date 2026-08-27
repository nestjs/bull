import {
  BullQueueProcessorCallback,
  BullQueueSeparateProcessor,
} from '../bull.types.js';

/**
 * @publicApi
 */
export interface BullQueueAdvancedProcessor {
  concurrency?: number;
  name?: string;
  callback: BullQueueProcessorCallback;
}

/**
 * @publicApi
 */
export interface BullQueueAdvancedSeparateProcessor {
  concurrency?: number;
  name?: string;
  path: BullQueueSeparateProcessor;
}
