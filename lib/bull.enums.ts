export enum BullQueueEvents {
  ERROR = 'error',
  WAITING = 'waiting',
  ACTIVE = 'active',
  STALLED = 'stalled',
  PROGRESS = 'progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PAUSED = 'paused',
  RESUMED = 'resumed',
  CLEANED = 'cleaned',
  DRAINED = 'drained',
  REMOVED = 'removed',
}

export enum BullQueueGlobalEvents {
  ERROR = 'global:error',
  WAITING = 'global:waiting',
  ACTIVE = 'global:active',
  STALLED = 'global:stalled',
  PROGRESS = 'global:progress',
  COMPLETED = 'global:completed',
  FAILED = 'global:failed',
  PAUSED = 'global:paused',
  RESUMED = 'global:resumed',
  CLEANED = 'global:cleaned',
  DRAINED = 'global:drained',
  REMOVED = 'global:removed',
}
