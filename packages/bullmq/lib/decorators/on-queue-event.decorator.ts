import { SetMetadata } from '@nestjs/common';
import { QueueEventsListener } from 'bullmq';
import { ON_QUEUE_EVENT_METADATA } from '../bull.constants';

export interface OnQueueEventMetadata {
  eventName: keyof QueueEventsListener;
}

/**
 * Registers a queue event listener.
 * Class that contains queue event listeners must be annotated
 * with the "QueueEventsListener" decorator.
 */
export const OnQueueEvent = (
  eventName: keyof QueueEventsListener,
): MethodDecorator =>
  SetMetadata(ON_QUEUE_EVENT_METADATA, { eventName } as OnQueueEventMetadata);
