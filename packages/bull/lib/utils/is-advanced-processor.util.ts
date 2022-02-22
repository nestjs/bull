import { BullQueueProcessor } from '../bull.types';
import { BullQueueAdvancedProcessor } from '../interfaces/bull.interfaces';
import { isProcessorCallback } from './is-processor-callback.util';

export function isAdvancedProcessor(
  processor: BullQueueProcessor,
): processor is BullQueueAdvancedProcessor {
  return (
    'object' === typeof processor &&
    !!(processor as BullQueueAdvancedProcessor).callback &&
    isProcessorCallback((processor as BullQueueAdvancedProcessor).callback)
  );
}
