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
} from './bull.interfaces';
import { BullQueueEvent } from './bull.types';

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

export const OnQueueEvent = (eventName: BullQueueEvent): MethodDecorator =>
  SetMetadata(BULL_MODULE_ON_QUEUE_EVENT, { eventName });

export const OnQueueError = () => OnQueueEvent(BullQueueEvents.ERROR);

export const OnQueueWaiting = () => OnQueueEvent(BullQueueEvents.WAITING);

export const OnQueueActive = () => OnQueueEvent(BullQueueEvents.ACTIVE);

export const OnQueueStalled = () => OnQueueEvent(BullQueueEvents.STALLED);

export const OnQueueProgress = () => OnQueueEvent(BullQueueEvents.PROGRESS);

export const OnQueueCompleted = () => OnQueueEvent(BullQueueEvents.COMPLETED);

export const OnQueueFailed = () => OnQueueEvent(BullQueueEvents.FAILED);

export const OnQueuePaused = () => OnQueueEvent(BullQueueEvents.PAUSED);

export const OnQueueResumed = () => OnQueueEvent(BullQueueEvents.RESUMED);

export const OnQueueCleaned = () => OnQueueEvent(BullQueueEvents.CLEANED);

export const OnQueueDrained = () => OnQueueEvent(BullQueueEvents.DRAINED);

export const OnQueueRemoved = () => OnQueueEvent(BullQueueEvents.REMOVED);

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
