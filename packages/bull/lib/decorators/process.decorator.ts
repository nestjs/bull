import { SetMetadata } from '@nestjs/common';
import { isString } from '@nestjs/common/utils/shared.utils';
import { BULL_MODULE_QUEUE_PROCESS } from '../bull.constants';

/**
 * @publicApi
 */
export interface ProcessOptions {
  name?: string;
  concurrency?: number;
}

/**
 * @publicApi
 */
export function Process(): MethodDecorator;
export function Process(name: string): MethodDecorator;
export function Process(options: ProcessOptions): MethodDecorator;
export function Process(
  nameOrOptions?: string | ProcessOptions,
): MethodDecorator {
  const options = isString(nameOrOptions)
    ? { name: nameOrOptions }
    : nameOrOptions;
  return SetMetadata(BULL_MODULE_QUEUE_PROCESS, options || {});
}
