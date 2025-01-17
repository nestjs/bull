import { Scope, SetMetadata } from '@nestjs/common';
import { SCOPE_OPTIONS_METADATA } from '@nestjs/common/constants';
import { PROCESSOR_METADATA, WORKER_METADATA } from '../bull.constants';
import { NestWorkerOptions } from '../interfaces/worker-options.interface';

export interface ProcessorOptions {
  /**
   * Specifies the name of the queue to subscribe to.
   */
  name?: string;
  /**
   * Specifies the lifetime of an injected Processor.
   */
  scope?: Scope;
  /**
   * A key (configuration key) under which the queue/connection configuration should be available.
   */
  configKey?: string;
}

/**
 * Represents a worker that is able to process jobs from the queue.
 * @param queueName name of the queue to process
 */
export function Processor(queueName: string): ClassDecorator;
/**
 * Represents a worker that is able to process jobs from the queue.
 * @param queueName name of the queue to process
 * @param workerOptions additional worker options
 */
export function Processor(
  queueName: string,
  workerOptions: NestWorkerOptions,
): ClassDecorator;
/**
 * Represents a worker that is able to process jobs from the queue.
 * @param processorOptions processor options
 */
export function Processor(processorOptions: ProcessorOptions): ClassDecorator;
/**
 * Represents a worker that is able to process jobs from the queue.
 * @param processorOptions processor options (Nest-specific)
 * @param workerOptions additional Bull worker options
 */
export function Processor(
  processorOptions: ProcessorOptions,
  workerOptions: NestWorkerOptions,
): ClassDecorator;
export function Processor(
  queueNameOrOptions?: string | ProcessorOptions,
  maybeWorkerOptions?: NestWorkerOptions,
): ClassDecorator {
  const options =
    queueNameOrOptions && typeof queueNameOrOptions === 'object'
      ? queueNameOrOptions
      : { name: queueNameOrOptions };

  return (target: Function) => {
    SetMetadata(SCOPE_OPTIONS_METADATA, options)(target);
    SetMetadata(PROCESSOR_METADATA, options)(target);

    if (maybeWorkerOptions) {
      SetMetadata(WORKER_METADATA, maybeWorkerOptions)(target);
    }
  };
}
