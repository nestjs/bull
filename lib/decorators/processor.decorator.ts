import { SetMetadata } from '@nestjs/common';
import { BULL_MODULE_QUEUE } from '../bull.constants';

export interface ProcessorOptions {
  name?: string;
}

export const Processor = (options?: ProcessorOptions): ClassDecorator =>
  SetMetadata(BULL_MODULE_QUEUE, options || {});
