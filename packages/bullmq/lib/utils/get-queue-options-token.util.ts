export function getQueueOptionsToken(name?: string): string {
  return name ? `BullMQQueueOptions_${name}` : 'BullMQQueueOptions_default';
}
