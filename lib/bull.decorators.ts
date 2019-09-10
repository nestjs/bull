import { Inject, SetMetadata, Logger } from '@nestjs/common';
import { getQueueToken } from './bull.utils';
import {
  BULL_MODULE_QUEUE,
  BULL_MODULE_QUEUE_PROCESS,
  BULL_MODULE_ON_QUEUE_EVENT,
} from './bull.constants';
import { BullQueueEvents, BullQueueGlobalEvents } from './bull.enums';
import {
  QueueProcessDecoratorOptions,
  QueueDecoratorOptions,
  QueueEventDecoratorOptions,
} from './bull.interfaces';
import { BullQueueEvent, BullQueueEventOptions } from './bull.types';

export const InjectQueue = (name?: string): ParameterDecorator =>
  Inject(getQueueToken(name));

export const Queue = (options?: QueueDecoratorOptions): ClassDecorator => {
  Logger.warn(
    `The 'Queue' decorator is deprecated in favor of 'Processor' and will soon be removed.`,
    'BullModule',
    false,
  );
  return Processor(options);
};

export const Processor = (options?: QueueDecoratorOptions): ClassDecorator =>
  SetMetadata(BULL_MODULE_QUEUE, options || {});

export const QueueProcess = (
  options?: QueueProcessDecoratorOptions,
): MethodDecorator => {
  Logger.warn(
    `The 'QueueProcess' decorator is deprecated in favor of 'Process' and will soon be removed.`,
    'BullModule',
    false,
  );
  return Process(options);
};

export const Process = (
  options?: QueueProcessDecoratorOptions,
): MethodDecorator => SetMetadata(BULL_MODULE_QUEUE_PROCESS, options || {});

export const OnQueueEvent = (
  eventNameOrOptions: BullQueueEvent | BullQueueEventOptions,
): MethodDecorator =>
  SetMetadata(
    BULL_MODULE_ON_QUEUE_EVENT,
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

export const OnGlobalQueueError = () =>
  OnQueueEvent(BullQueueGlobalEvents.ERROR);

export const OnGlobalQueueWaiting = () =>
  OnQueueEvent(BullQueueGlobalEvents.WAITING);

export const OnGlobalQueueActive = () =>
  OnQueueEvent(BullQueueGlobalEvents.ACTIVE);

export const OnGlobalQueueStalled = () =>
  OnQueueEvent(BullQueueGlobalEvents.STALLED);

export const OnGlobalQueueProgress = () =>
  OnQueueEvent(BullQueueGlobalEvents.PROGRESS);

export const OnGlobalQueueCompleted = () =>
  OnQueueEvent(BullQueueGlobalEvents.COMPLETED);

export const OnGlobalQueueFailed = () =>
  OnQueueEvent(BullQueueGlobalEvents.FAILED);

export const OnGlobalQueuePaused = () =>
  OnQueueEvent(BullQueueGlobalEvents.PAUSED);

export const OnGlobalQueueResumed = () =>
  OnQueueEvent(BullQueueGlobalEvents.RESUMED);

export const OnGlobalQueueCleaned = () =>
  OnQueueEvent(BullQueueGlobalEvents.CLEANED);

export const OnGlobalQueueDrained = () =>
  OnQueueEvent(BullQueueGlobalEvents.DRAINED);

export const OnGlobalQueueRemoved = () =>
  OnQueueEvent(BullQueueGlobalEvents.REMOVED);
