export function getQueueSchedulerToken(name?: string): string {
  return name ? `BullQueueScheduler_${name}` : 'BullQueueScheduler_default';
}
