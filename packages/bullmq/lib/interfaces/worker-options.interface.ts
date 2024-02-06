import { WorkerOptions } from 'bullmq';
import { PartialThisParameter } from '../utils/partial-this-parameter.type';

export interface NestWorkerOptions
  extends PartialThisParameter<WorkerOptions, 'connection'> {
  /**
   * @deperecated
   * This option is not supported in BullMQ 5 and considered a bad practice in prior versions.
   * */
  sharedConnection?: boolean;
}
