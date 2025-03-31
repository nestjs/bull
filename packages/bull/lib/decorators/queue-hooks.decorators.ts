import { SetMetadata } from '@nestjs/common';
import { BULL_MODULE_ON_QUEUE_EVENT } from '../bull.constants';
import {
  BullQueueEvent,
  BullQueueEventOptions,
  QueueEventDecoratorOptions,
} from '../bull.types';
import { BullQueueEvents, BullQueueGlobalEvents } from '../enums';

/**
 * @publicApi
 */
export const OnQueueEvent = (
  eventNameOrOptions: BullQueueEvent | BullQueueEventOptions,
): MethodDecorator =>
  SetMetadata(
    BULL_MODULE_ON_QUEUE_EVENT,
    typeof eventNameOrOptions === 'string'
      ? { eventName: eventNameOrOptions }
      : eventNameOrOptions,
  );

/**
 * @publicApi
 */
export const OnQueueError = (options?: QueueEventDecoratorOptions) =>
  OnQueueEvent({ ...options, eventName: BullQueueEvents.ERROR });

/**
 * @publicApi
 */
export const OnQueueWaiting = (options?: QueueEventDecoratorOptions) =>
  OnQueueEvent({ ...options, eventName: BullQueueEvents.WAITING });

/**
 * @publicApi
 */
export const OnQueueActive = (options?: QueueEventDecoratorOptions) =>
  OnQueueEvent({ ...options, eventName: BullQueueEvents.ACTIVE });

/**
 * @publicApi
 */
export const OnQueueStalled = (options?: QueueEventDecoratorOptions) =>
  OnQueueEvent({ ...options, eventName: BullQueueEvents.STALLED });

/**
 * @publicApi
 */
export const OnQueueProgress = (options?: QueueEventDecoratorOptions) =>
  OnQueueEvent({ ...options, eventName: BullQueueEvents.PROGRESS });

/**
 * @publicApi
 */
export const OnQueueCompleted = (options?: QueueEventDecoratorOptions) =>
  OnQueueEvent({ ...options, eventName: BullQueueEvents.COMPLETED });

/**
 * @publicApi
 */
export const OnQueueFailed = (options?: QueueEventDecoratorOptions) =>
  OnQueueEvent({ ...options, eventName: BullQueueEvents.FAILED });

/**
 * @publicApi
 */
export const OnQueuePaused = (options?: QueueEventDecoratorOptions) =>
  OnQueueEvent({ ...options, eventName: BullQueueEvents.PAUSED });

/**
 * @publicApi
 */
export const OnQueueResumed = (options?: QueueEventDecoratorOptions) =>
  OnQueueEvent({ ...options, eventName: BullQueueEvents.RESUMED });

/**
 * @publicApi
 */
export const OnQueueCleaned = (options?: QueueEventDecoratorOptions) =>
  OnQueueEvent({ ...options, eventName: BullQueueEvents.CLEANED });

/**
 * @publicApi
 */
export const OnQueueDrained = (options?: QueueEventDecoratorOptions) =>
  OnQueueEvent({ ...options, eventName: BullQueueEvents.DRAINED });

/**
 * @publicApi
 */
export const OnQueueRemoved = (options?: QueueEventDecoratorOptions) =>
  OnQueueEvent({ ...options, eventName: BullQueueEvents.REMOVED });

/**
 * @publicApi
 */
export const OnGlobalQueueError = (options?: QueueEventDecoratorOptions) =>
  OnQueueEvent({ ...options, eventName: BullQueueGlobalEvents.ERROR });

/**
 * @publicApi
 */
export const OnGlobalQueueWaiting = (options?: QueueEventDecoratorOptions) =>
  OnQueueEvent({ ...options, eventName: BullQueueGlobalEvents.WAITING });

/**
 * @publicApi
 */
export const OnGlobalQueueActive = (options?: QueueEventDecoratorOptions) =>
  OnQueueEvent({ ...options, eventName: BullQueueGlobalEvents.ACTIVE });

/**
 * @publicApi
 */
export const OnGlobalQueueStalled = (options?: QueueEventDecoratorOptions) =>
  OnQueueEvent({ ...options, eventName: BullQueueGlobalEvents.STALLED });

/**
 * @publicApi
 */
export const OnGlobalQueueProgress = (options?: QueueEventDecoratorOptions) =>
  OnQueueEvent({ ...options, eventName: BullQueueGlobalEvents.PROGRESS });

/**
 * @publicApi
 */
export const OnGlobalQueueCompleted = (options?: QueueEventDecoratorOptions) =>
  OnQueueEvent({ ...options, eventName: BullQueueGlobalEvents.COMPLETED });

/**
 * @publicApi
 */
export const OnGlobalQueueFailed = (options?: QueueEventDecoratorOptions) =>
  OnQueueEvent({ ...options, eventName: BullQueueGlobalEvents.FAILED });

/**
 * @publicApi
 */
export const OnGlobalQueuePaused = (options?: QueueEventDecoratorOptions) =>
  OnQueueEvent({ ...options, eventName: BullQueueGlobalEvents.PAUSED });

/**
 * @publicApi
 */
export const OnGlobalQueueResumed = (options?: QueueEventDecoratorOptions) =>
  OnQueueEvent({ ...options, eventName: BullQueueGlobalEvents.RESUMED });

/**
 * @publicApi
 */
export const OnGlobalQueueCleaned = (options?: QueueEventDecoratorOptions) =>
  OnQueueEvent({ ...options, eventName: BullQueueGlobalEvents.CLEANED });

/**
 * @publicApi
 */
export const OnGlobalQueueDrained = (options?: QueueEventDecoratorOptions) =>
  OnQueueEvent({ ...options, eventName: BullQueueGlobalEvents.DRAINED });

/**
 * @publicApi
 */
export const OnGlobalQueueRemoved = (options?: QueueEventDecoratorOptions) =>
  OnQueueEvent({ ...options, eventName: BullQueueGlobalEvents.REMOVED });
