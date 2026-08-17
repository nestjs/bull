import {
  BullQueueProcessor,
  BullQueueSeparateProcessor,
} from '../bull.types.js';

export function isSeparateProcessor(
  processor: BullQueueProcessor,
): processor is BullQueueSeparateProcessor {
  return 'string' === typeof processor;
}
