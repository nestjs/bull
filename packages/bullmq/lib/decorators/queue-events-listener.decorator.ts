import { SetMetadata } from '@nestjs/common';
import { QUEUE_EVENTS_LISTENER_METADATA } from '../bull.constants';
import { NestQueueEventOptions } from '../interfaces/queue-event-options.interface';

export type QueueEventsListenerOptions = {
  queueName: string;
  queueEventsOptions?: NestQueueEventOptions;
};

/**
 * Represents a "QueueEvents" component (class that reacts to queue events).
 */
export function QueueEventsListener(
  queueName: string,
  queueEventsOptions?: NestQueueEventOptions,
): ClassDecorator {
  return (target: Function) => {
    SetMetadata(QUEUE_EVENTS_LISTENER_METADATA, {
      queueName,
      queueEventsOptions,
    })(target);
  };
}
