import { WorkerOptions } from 'bullmq';
import { BullMQBackendFactory } from '../bull.types.js';
import { PartialThisParameter } from '../utils/partial-this-parameter.type.js';

/**
 * @publicApi
 */
export interface NestWorkerOptions extends PartialThisParameter<
  WorkerOptions,
  'connection'
> {
  /**
   * @deprecated
   * This option is not supported in BullMQ 5 and considered a bad practice in prior versions.
   * */
  sharedConnection?: boolean;

  /**
   * Custom pluggable backend factory for BullMQ (e.g., PostgreSQL backend).
   */
  backendFactory?: BullMQBackendFactory;
}
