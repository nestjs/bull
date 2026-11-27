import { SetMetadata } from '@nestjs/common';
import { QUEUE_EVENTS_LISTENER_METADATA } from '../bull.constants.js';
import { NestQueueEventOptions } from '../interfaces/queue-event-options.interface.js';

/**
 * @publicApi
 */
export type QueueEventsListenerOptions = {
  /**
   * Specifies the name of the queue to listen to.
   */
  queueName: string;
  /**
   * Additional queue events options.
   */
  queueEventsOptions?: NestQueueEventOptions;
  /**
   * A key (configuration key) under which the queue/connection configuration should be available.
   * Used when the queue is not registered in the module; a registered queue's options take precedence.
   */
  configKey?: string;
};

/**
 * Represents a "QueueEvents" component (class that reacts to queue events).
 * @param queueEventsListenerOptions queue events listener options
 *
 * @publicApi
 */
export function QueueEventsListener(
  queueEventsListenerOptions: QueueEventsListenerOptions,
): ClassDecorator;

/**
 * Represents a "QueueEvents" component (class that reacts to queue events).
 * @param queueName name of the queue to listen to
 * @param queueEventsOptions additional queue events options
 *
 * @publicApi
 */
export function QueueEventsListener(
  queueName: string,
  queueEventsOptions?: NestQueueEventOptions,
): ClassDecorator;
export function QueueEventsListener(
  queueNameOrOptions: string | QueueEventsListenerOptions,
  queueEventsOptions?: NestQueueEventOptions,
): ClassDecorator {
  const options: QueueEventsListenerOptions =
    queueNameOrOptions && typeof queueNameOrOptions === 'object'
      ? queueNameOrOptions
      : { queueName: queueNameOrOptions as string, queueEventsOptions };

  return (target: Function) => {
    SetMetadata(QUEUE_EVENTS_LISTENER_METADATA, options)(target);
  };
}
