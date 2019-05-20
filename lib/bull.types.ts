import { DoneCallback, Job } from 'bull';
import {
  BullQueueAdvancedProcessor,
  BullQueueAdvancedSeparateProcessor,
} from './bull.interfaces';

export type BullQueueProcessor =
  | BullQueueProcessorCallback
  | BullQueueAdvancedProcessor
  | BullQueueSeparateProcessor
  | BullQueueAdvancedSeparateProcessor;

export type BullQueueProcessorCallback = (
  job: Job,
  done?: DoneCallback,
) => void;

export type BullQueueSeparateProcessor = string;

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

export type BullQueueEvent =
  | 'error'
  | 'waiting'
  | 'active'
  | 'stalled'
  | 'progress'
  | 'completed'
  | 'failed'
  | 'paused'
  | 'resumed'
  | 'cleaned'
  | 'drained'
  | 'removed'
  | 'global:error'
  | 'global:waiting'
  | 'global:active'
  | 'global:stalled'
  | 'global:progress'
  | 'global:completed'
  | 'global:failed'
  | 'global:paused'
  | 'global:resumed'
  | 'global:cleaned'
  | 'global:drained'
  | 'global:removed';
