import { OnApplicationShutdown } from '@nestjs/common';
import { Job, Worker } from 'bullmq';

export abstract class WorkerHost<T extends Worker = Worker>
  implements OnApplicationShutdown
{
  readonly worker: T;

  abstract process(job: Job): Promise<any>;

  onApplicationShutdown(signal?: string) {
    return this.worker.close();
  }
}
