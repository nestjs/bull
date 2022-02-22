import { getQueueToken } from '@nestjs/bull-internal';
import { Inject } from '@nestjs/common';

export const InjectQueue = (name?: string): ParameterDecorator =>
  Inject(getQueueToken(name));
