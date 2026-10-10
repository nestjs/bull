import { WorkerOptions } from 'bullmq';
import {
  BullMQBackendFactory,
  BullQueueProcessorCallback,
  BullQueueSeparateProcessor,
} from '../bull.types.js';

/**
 * @publicApi
 */
export interface BullQueueAdvancedProcessor extends Partial<WorkerOptions> {
  concurrency?: number;
  callback: BullQueueProcessorCallback;
  backendFactory?: BullMQBackendFactory;
}

export interface BullQueueAdvancedSeparateProcessor extends Partial<WorkerOptions> {
  concurrency?: number;
  path: BullQueueSeparateProcessor;
  useWorkerThreads?: boolean;
  backendFactory?: BullMQBackendFactory;
}
