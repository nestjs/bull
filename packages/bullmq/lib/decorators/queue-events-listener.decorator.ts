import { SetMetadata } from '@nestjs/common';
import { QueueEventsOptions } from 'bullmq';
import { QUEUE_EVENTS_LISTENER_METADATA } from '../bull.constants';

export type QueueEventsListenerOptions = {
  queueName: string;
  queueEventsOptions?: QueueEventsOptions;
};

/**
 * Represents a "QueueEvents" component (class that reacts to queue events).
 */
export function QueueEventsListener(
  queueName: string,
  queueEventsOptions?: QueueEventsOptions,
): ClassDecorator {
  return (target: Function) => {
    SetMetadata(QUEUE_EVENTS_LISTENER_METADATA, {
      queueName,
      queueEventsOptions,
    })(target);
  };
}
