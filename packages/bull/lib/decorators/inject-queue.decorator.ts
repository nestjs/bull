import { getQueueToken } from '@nestjs/bull-internal';
import { Inject } from '@nestjs/common';

/**
 * Injects Bull's queue instance with the given name
 * @param name queue name
 */
export const InjectQueue = (name?: string): ParameterDecorator =>
  Inject(getQueueToken(name));
