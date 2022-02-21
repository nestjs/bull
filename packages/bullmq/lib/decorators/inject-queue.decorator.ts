import { Inject } from '@nestjs/common';
import { getQueueToken } from '../utils';

/**
 * Injects Bull's queue instance with the given name
 * @param name queue name
 */
export const InjectQueue = (name?: string): ParameterDecorator =>
  Inject(getQueueToken(name));
