import { Inject } from '@nestjs/common';
import { getQueueToken } from './bull.utils';

export function InjectQueue(name?: string): ParameterDecorator {
  return Inject(getQueueToken(name));
}
