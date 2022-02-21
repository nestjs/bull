import {
  BullQueueProcessor,
  BullQueueProcessorCallback,
  BullQueueSeparateProcessor,
} from '../bull.types';
import {
  BullQueueAdvancedProcessor,
  BullQueueAdvancedSeparateProcessor,
} from '../interfaces/bull.interfaces';

export function isProcessorCallback(
  processor: BullQueueProcessor,
): processor is BullQueueProcessorCallback {
  return 'function' === typeof processor;
}

export function isAdvancedProcessor(
  processor: BullQueueProcessor,
): processor is BullQueueAdvancedProcessor {
  return (
    'object' === typeof processor &&
    !!(processor as BullQueueAdvancedProcessor).callback &&
    isProcessorCallback((processor as BullQueueAdvancedProcessor).callback)
  );
}

export function isSeparateProcessor(
  processor: BullQueueProcessor,
): processor is BullQueueSeparateProcessor {
  return 'string' === typeof processor;
}

export function isAdvancedSeparateProcessor(
  processor: BullQueueProcessor,
): processor is BullQueueAdvancedSeparateProcessor {
  return (
    'object' === typeof processor &&
    !!(processor as BullQueueAdvancedSeparateProcessor).path &&
    isSeparateProcessor((processor as BullQueueAdvancedSeparateProcessor).path)
  );
}
