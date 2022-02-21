import { Inject } from '@nestjs/common';
import { getQueueToken } from '../utils';

export const InjectQueue = (name?: string): ParameterDecorator =>
  Inject(getQueueToken(name));
