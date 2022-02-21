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
