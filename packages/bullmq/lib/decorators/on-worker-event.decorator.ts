import { SetMetadata } from '@nestjs/common';
import { WorkerListener } from 'bullmq';
import { ON_WORKER_EVENT_METADATA } from '../bull.constants';

/**
 * @publicApi
 */
export interface OnWorkerEventMetadata {
  eventName: keyof WorkerListener;
}

/**
 * Registers a worker event listener.
 * Class that contains worker event listeners must be annotated
 * with the "Processor" decorator.
 *
 * @publicApi
 */
export const OnWorkerEvent = (
  eventName: keyof WorkerListener,
): MethodDecorator =>
  SetMetadata(ON_WORKER_EVENT_METADATA, {
    eventName: eventName,
  } as OnWorkerEventMetadata);
