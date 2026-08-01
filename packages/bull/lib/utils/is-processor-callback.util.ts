import {
  BullQueueProcessor,
  BullQueueProcessorCallback,
} from '../bull.types.js';

export function isProcessorCallback(
  processor: BullQueueProcessor,
): processor is BullQueueProcessorCallback {
  return 'function' === typeof processor;
}
