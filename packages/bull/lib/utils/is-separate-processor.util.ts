import { BullQueueProcessor, BullQueueSeparateProcessor } from '../bull.types';

export function isSeparateProcessor(
  processor: BullQueueProcessor,
): processor is BullQueueSeparateProcessor {
  return 'string' === typeof processor;
}
