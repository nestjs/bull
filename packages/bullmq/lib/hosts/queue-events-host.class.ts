import { OnApplicationShutdown } from '@nestjs/common';
import { QueueEvents } from 'bullmq';

export abstract class QueueEventsHost<T extends QueueEvents = QueueEvents>
  implements OnApplicationShutdown
{
  private _queueEvents: T | undefined;

  get queueEvents(): T {
    if (!this._queueEvents) {
      throw new Error(
        '"QueueEvents" class has not yet been initialized. Make sure to interact with queue events instances after the "onModuleInit" lifecycle hook is triggered, for example, in the "onApplicationBootstrap" hook.',
      );
    }
    return this._queueEvents;
  }

  onApplicationShutdown(signal?: string) {
    return this._queueEvents?.close();
  }
}
