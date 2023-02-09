export function getFlowProducerOptionsToken(name?: string): string {
  return name ? `BullMQFlowProducerOptions_${name}` : 'BullMQFlowProducerOptions_default';
}
