import { SetMetadata } from '@nestjs/common';
import { BULL_MODULE_QUEUE } from '../bull.constants';

export interface ProcessorOptions {
  name?: string;
}

export const Processor = (queueName?: string): ClassDecorator =>
  SetMetadata(BULL_MODULE_QUEUE, { name: queueName });
