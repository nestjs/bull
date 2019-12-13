import { SetMetadata } from '@nestjs/common';
import { BULL_MODULE_QUEUE_PROCESS } from '../bull.constants';

export interface ProcessOptions {
  name?: string;
  concurrency?: number;
}

export const Process = (options?: ProcessOptions): MethodDecorator =>
  SetMetadata(BULL_MODULE_QUEUE_PROCESS, options || {});
