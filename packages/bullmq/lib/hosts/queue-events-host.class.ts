import { OnApplicationShutdown } from '@nestjs/common';
import { QueueEvents } from 'bullmq';

export abstract class QueueEventsHost<T extends QueueEvents = QueueEvents>
  implements OnApplicationShutdown
{
  readonly queueEvents: T;

  onApplicationShutdown(signal?: string) {
    return this.queueEvents.close();
  }
}
