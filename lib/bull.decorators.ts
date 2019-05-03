import { Inject } from '@nestjs/common';
import { getQueueToken } from './bull.utils';
import {
  BULL_MODULE_QUEUE_LISTENER,
  BULL_MODULE_PROCESS,
  BULL_MODULE_ON_EVENT,
} from './bull.constants';
import { BullQueueEvent } from './bull.types';
import { BullQueueEvents, BullQueueGlobalEvents } from './bull.enums';
import { ProcessOptions, QueueListenerOptions } from './bull.interfaces';

export const InjectQueue = (name?: string): ParameterDecorator =>
  Inject(getQueueToken(name));

export const QueueListener = (
  options?: QueueListenerOptions,
): ClassDecorator => (target: any) => {
  Reflect.defineMetadata(BULL_MODULE_QUEUE_LISTENER, options || {}, target);
};

export const Process = (options?: ProcessOptions): MethodDecorator => (
  target: any,
  propertyName: string,
) => {
  Reflect.defineMetadata(BULL_MODULE_PROCESS, options, target, propertyName);
};

export const OnEvent = (eventName: BullQueueEvent): MethodDecorator => (
  target: any,
  propertyName: string,
) => {
  Reflect.defineMetadata(
    BULL_MODULE_ON_EVENT,
    { eventName },
    target,
    propertyName,
  );
};

export const OnError = () => OnEvent(BullQueueEvents.ERROR);

export const OnWaiting = () => OnEvent(BullQueueEvents.WAITING);

export const OnActive = () => OnEvent(BullQueueEvents.ACTIVE);

export const OnStalled = () => OnEvent(BullQueueEvents.STALLED);

export const OnProgress = () => OnEvent(BullQueueEvents.PROGRESS);

export const OnCompleted = () => OnEvent(BullQueueEvents.COMPLETED);

export const OnFailed = () => OnEvent(BullQueueEvents.FAILED);

export const OnPaused = () => OnEvent(BullQueueEvents.PAUSED);

export const OnResumed = () => OnEvent(BullQueueEvents.RESUMED);

export const OnCleaned = () => OnEvent(BullQueueEvents.CLEANED);

export const OnDrained = () => OnEvent(BullQueueEvents.DRAINED);

export const OnRemoved = () => OnEvent(BullQueueEvents.REMOVED);

export const OnGlobalError = () => OnEvent(BullQueueGlobalEvents.ERROR);

export const OnGlobalWaiting = () => OnEvent(BullQueueGlobalEvents.WAITING);

export const OnGlobalActive = () => OnEvent(BullQueueGlobalEvents.ACTIVE);

export const OnGlobalStalled = () => OnEvent(BullQueueGlobalEvents.STALLED);

export const OnGlobalProgress = () => OnEvent(BullQueueGlobalEvents.PROGRESS);

export const OnGlobalCompleted = () => OnEvent(BullQueueGlobalEvents.COMPLETED);

export const OnGlobalFailed = () => OnEvent(BullQueueGlobalEvents.FAILED);

export const OnGlobalPaused = () => OnEvent(BullQueueGlobalEvents.PAUSED);

export const OnGlobalResumed = () => OnEvent(BullQueueGlobalEvents.RESUMED);

export const OnGlobalCleaned = () => OnEvent(BullQueueGlobalEvents.CLEANED);

export const OnGlobalDrained = () => OnEvent(BullQueueGlobalEvents.DRAINED);

export const OnGlobalRemoved = () => OnEvent(BullQueueGlobalEvents.REMOVED);
