export function getFlowProducerToken(name?: string): string {
  return name ? `BullFlowProducer_${name}` : 'BullFlowProducer_default';
}
