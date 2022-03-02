export function getQueueToken(name?: string): string {
  return name ? `BullQueue_${name}` : 'BullQueue_default';
}
