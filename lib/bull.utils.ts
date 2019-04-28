export function getQueueToken(name?: string): string {
  return name ? `BullQueue_${name}` : 'BullQueue_default';
}

export function getQueueOptionsToken(name?: string): string {
  return name ? `BullQueueOptions_${name}` : 'BullQueueOptions_default';
}
