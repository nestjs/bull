import { Inject } from '@nestjs/common';
import { getFlowProducerToken } from '../utils';

/**
 * Injects Bull's flow producer instance with the given name
 * @param name flow producer name
 */
export const InjectFlowProducer = (name?: string): ParameterDecorator =>
 Inject(getFlowProducerToken(name));