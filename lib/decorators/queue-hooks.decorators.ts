import { SetMetadata } from '@nestjs/common';
import { BULL_MODULE_ON_QUEUE_EVENT, BULL_MODULE_ON_GLOBAL_QUEUE_EVENT } from '../bull.constants';
import {
  BullQueueEvent,
  BullQueueEventOptions,
  QueueEventDecoratorOptions,
} from '../bull.types';
import { BullQueueEvents, BullQueueGlobalEvents } from '../enums';

export const OnQueueEvent = (
  eventNameOrOptions: BullQueueEvent | BullQueueEventOptions,
): MethodDecorator =>
  SetMetadata(
    BULL_MODULE_ON_QUEUE_EVENT,
    typeof eventNameOrOptions === 'string'
      ? { eventName: eventNameOrOptions }
      : eventNameOrOptions,
  );

export const OnGlobalQueueEvent = (
  eventNameOrOptions: BullQueueGlobalEvents | BullQueueEventOptions,
): MethodDecorator =>
  SetMetadata(
    BULL_MODULE_ON_GLOBAL_QUEUE_EVENT,
    typeof eventNameOrOptions === 'string'
      ? { eventName: eventNameOrOptions }
      : eventNameOrOptions,
  );

export const OnQueueError = (options?: QueueEventDecoratorOptions) =>
  OnQueueEvent({ ...options, eventName: BullQueueEvents.ERROR });

export const OnQueueWaiting = (options?: QueueEventDecoratorOptions) =>
  OnQueueEvent({ ...options, eventName: BullQueueEvents.WAITING });

export const OnQueueActive = (options?: QueueEventDecoratorOptions) =>
  OnQueueEvent({ ...options, eventName: BullQueueEvents.ACTIVE });

export const OnQueueStalled = (options?: QueueEventDecoratorOptions) =>
  OnQueueEvent({ ...options, eventName: BullQueueEvents.STALLED });

export const OnQueueProgress = (options?: QueueEventDecoratorOptions) =>
  OnQueueEvent({ ...options, eventName: BullQueueEvents.PROGRESS });

export const OnQueueCompleted = (options?: QueueEventDecoratorOptions) =>
  OnQueueEvent({ ...options, eventName: BullQueueEvents.COMPLETED });

export const OnQueueFailed = (options?: QueueEventDecoratorOptions) =>
  OnQueueEvent({ ...options, eventName: BullQueueEvents.FAILED });

export const OnQueuePaused = (options?: QueueEventDecoratorOptions) =>
  OnQueueEvent({ ...options, eventName: BullQueueEvents.PAUSED });

export const OnQueueResumed = (options?: QueueEventDecoratorOptions) =>
  OnQueueEvent({ ...options, eventName: BullQueueEvents.RESUMED });

export const OnQueueCleaned = (options?: QueueEventDecoratorOptions) =>
  OnQueueEvent({ ...options, eventName: BullQueueEvents.CLEANED });

export const OnQueueDrained = (options?: QueueEventDecoratorOptions) =>
  OnQueueEvent({ ...options, eventName: BullQueueEvents.DRAINED });

export const OnQueueRemoved = (options?: QueueEventDecoratorOptions) =>
  OnQueueEvent({ ...options, eventName: BullQueueEvents.REMOVED });

export const OnGlobalQueueError = (options?: QueueEventDecoratorOptions) =>
  OnGlobalQueueEvent({ ...options, eventName: BullQueueGlobalEvents.ERROR });

export const OnGlobalQueueWaiting = (options?: QueueEventDecoratorOptions) =>
  OnGlobalQueueEvent({ ...options, eventName: BullQueueGlobalEvents.WAITING });

export const OnGlobalQueueActive = (options?: QueueEventDecoratorOptions) =>
  OnGlobalQueueEvent({ ...options, eventName: BullQueueGlobalEvents.ACTIVE });

export const OnGlobalQueueStalled = (options?: QueueEventDecoratorOptions) =>
  OnGlobalQueueEvent({ ...options, eventName: BullQueueGlobalEvents.STALLED });

export const OnGlobalQueueProgress = (options?: QueueEventDecoratorOptions) =>
  OnGlobalQueueEvent({ ...options, eventName: BullQueueGlobalEvents.PROGRESS });

export const OnGlobalQueueCompleted = (options?: QueueEventDecoratorOptions) =>
  OnGlobalQueueEvent({ ...options, eventName: BullQueueGlobalEvents.COMPLETED });

export const OnGlobalQueueFailed = (options?: QueueEventDecoratorOptions) =>
  OnGlobalQueueEvent({ ...options, eventName: BullQueueGlobalEvents.FAILED });

export const OnGlobalQueuePaused = (options?: QueueEventDecoratorOptions) =>
  OnGlobalQueueEvent({ ...options, eventName: BullQueueGlobalEvents.PAUSED });

export const OnGlobalQueueResumed = (options?: QueueEventDecoratorOptions) =>
  OnGlobalQueueEvent({ ...options, eventName: BullQueueGlobalEvents.RESUMED });

export const OnGlobalQueueCleaned = (options?: QueueEventDecoratorOptions) =>
  OnGlobalQueueEvent({ ...options, eventName: BullQueueGlobalEvents.CLEANED });

export const OnGlobalQueueDrained = (options?: QueueEventDecoratorOptions) =>
  OnGlobalQueueEvent({ ...options, eventName: BullQueueGlobalEvents.DRAINED });

export const OnGlobalQueueRemoved = (options?: QueueEventDecoratorOptions) =>
  OnGlobalQueueEvent({ ...options, eventName: BullQueueGlobalEvents.REMOVED });
