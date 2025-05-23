import { QueueEventsOptions, Telemetry } from 'bullmq';
import { PartialThisParameter } from '../utils/partial-this-parameter.type';

/**
 * @publicApi
 */
export interface NestQueueEventOptions
  extends PartialThisParameter<QueueEventsOptions, 'connection'> {
  /**
   * @deprecated
   * This option is not supported in BullMQ 5 and considered a bad practice in prior versions.
   *
   */
  sharedConnection?: boolean;
  telemetry?: Telemetry<any>;
}
