import { QueueOptions } from 'bullmq';
import { PartialThisParameter } from '../utils/partial-this-parameter.type';

/**
 * @publicApi
 */
export interface NestQueueOptions
  extends PartialThisParameter<QueueOptions, 'connection'> {
  /**
   * @deprecated
   * This option is not supported in BullMQ 5 and considered a bad practice in prior versions.
   * */
  sharedConnection?: boolean;
}
