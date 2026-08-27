import { BullQueueProcessor } from '../bull.types.js';
import { BullQueueAdvancedProcessor } from '../interfaces/bull.interfaces.js';
import { isProcessorCallback } from './is-processor-callback.util.js';

export function isAdvancedProcessor(
  processor: BullQueueProcessor,
): processor is BullQueueAdvancedProcessor {
  return (
    'object' === typeof processor &&
    !!(processor as BullQueueAdvancedProcessor).callback &&
    isProcessorCallback((processor as BullQueueAdvancedProcessor).callback)
  );
}
