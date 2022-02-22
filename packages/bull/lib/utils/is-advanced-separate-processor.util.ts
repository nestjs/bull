import { BullQueueProcessor } from '../bull.types';
import { BullQueueAdvancedSeparateProcessor } from '../interfaces/bull.interfaces';
import { isSeparateProcessor } from './is-separate-processor.util';

export function isAdvancedSeparateProcessor(
  processor: BullQueueProcessor,
): processor is BullQueueAdvancedSeparateProcessor {
  return (
    'object' === typeof processor &&
    !!(processor as BullQueueAdvancedSeparateProcessor).path &&
    isSeparateProcessor((processor as BullQueueAdvancedSeparateProcessor).path)
  );
}
