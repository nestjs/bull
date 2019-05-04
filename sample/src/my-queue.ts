import {
  Queue,
  QueueProcess,
  OnQueueActive,
  OnQueueEvent,
  BullQueueEvents,
} from 'nest-bull';
import { NumberService } from './number.service';
import { Job, DoneCallback } from 'bull';
import { Logger } from '@nestjs/common';

@Queue()
export class MyQueue {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly service: NumberService) {}

  @QueueProcess({ name: 'twice' })
  processTwice(job: Job<number>) {
    return this.service.twice(job.data);
  }

  @QueueProcess({ name: 'thrice' })
  processThrice(job: Job<number>, callback: DoneCallback) {
    callback(null, this.service.thrice(job.data));
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }

  @OnQueueEvent(BullQueueEvents.COMPLETED)
  onCompleted(job: Job) {
    this.logger.log(
      `Completed job ${job.id} of type ${job.name} with result ${
        job.returnvalue
      }`,
    );
  }
}
