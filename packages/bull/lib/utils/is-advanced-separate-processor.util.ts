import { BullQueueProcessor } from '../bull.types.js';
import { BullQueueAdvancedSeparateProcessor } from '../interfaces/bull.interfaces.js';
import { isSeparateProcessor } from './is-separate-processor.util.js';

export function isAdvancedSeparateProcessor(
  processor: BullQueueProcessor,
): processor is BullQueueAdvancedSeparateProcessor {
  return (
    'object' === typeof processor &&
    !!(processor as BullQueueAdvancedSeparateProcessor).path &&
    isSeparateProcessor((processor as BullQueueAdvancedSeparateProcessor).path)
  );
}
