import { Inject } from '@nestjs/common';
import { getFlowProducerToken } from '../utils/index.js';

/**
 * Injects Bull's flow producer instance with the given name
 * @param name flow producer name
 *
 * @publicApi
 */
export const InjectFlowProducer = (name?: string): ReturnType<typeof Inject> =>
  Inject(getFlowProducerToken(name));
