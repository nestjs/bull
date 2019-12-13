export function getQueueOptionsToken(name?: string): string {
  return name ? `BullQueueOptions_${name}` : 'BullQueueOptions_default';
}
