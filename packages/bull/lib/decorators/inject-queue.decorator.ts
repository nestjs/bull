import { getQueueToken } from '@nestjs/bull-shared';
import { Inject } from '@nestjs/common';

/**
 * Injects Bull's queue instance with the given name
 * @param name queue name
 *
 * @publicApi
 */
export const InjectQueue = (name?: string): ReturnType<typeof Inject> =>
  Inject(getQueueToken(name));
