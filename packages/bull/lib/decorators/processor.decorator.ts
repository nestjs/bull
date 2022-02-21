import { Scope, SetMetadata } from '@nestjs/common';
import { SCOPE_OPTIONS_METADATA } from '@nestjs/common/constants';
import { BULL_MODULE_QUEUE } from '../bull.constants';

export interface ProcessorOptions {
  /**
   * Specifies the name of the queue to subscribe to.
   */
  name?: string;
  /**
   * Specifies the lifetime of an injected Processor.
   */
  scope?: Scope;
}

export function Processor(): ClassDecorator;
export function Processor(queueName: string): ClassDecorator;
export function Processor(processorOptions: ProcessorOptions): ClassDecorator;
export function Processor(
  queueNameOrOptions?: string | ProcessorOptions,
): ClassDecorator {
  const options =
    queueNameOrOptions && typeof queueNameOrOptions === 'object'
      ? queueNameOrOptions
      : { name: queueNameOrOptions };

  // eslint-disable-next-line @typescript-eslint/ban-types
  return (target: Function) => {
    SetMetadata(SCOPE_OPTIONS_METADATA, options)(target);
    SetMetadata(BULL_MODULE_QUEUE, options)(target);
  };
}
