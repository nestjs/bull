import { DoneCallback, Job } from 'bull';

export type BullQueueProcessor =
  | BullQueueProcessorCallback
  | BullQueueAdvancedProcessor;
export type BullQueueProcessorCallback = (
  job: Job,
  done?: DoneCallback,
) => void;
export interface BullQueueAdvancedProcessor {
  concurrency?: number;
  name?: string;
  callback: BullQueueProcessorCallback;
}

export function isAdvancedProcessor(
  processor: BullQueueProcessor,
): processor is BullQueueAdvancedProcessor {
  return 'object' === typeof processor && !!processor.callback;
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
