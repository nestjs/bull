import { WorkerOptions } from 'bullmq';
import {
  BullQueueProcessorCallback,
  BullQueueSeparateProcessor,
} from '../bull.types';

/**
 * @publicApi
 */
export interface BullQueueAdvancedProcessor extends Partial<WorkerOptions> {
  concurrency?: number;
  callback: BullQueueProcessorCallback;
}

export interface BullQueueAdvancedSeparateProcessor
  extends Partial<WorkerOptions> {
  concurrency?: number;
  path: BullQueueSeparateProcessor;
  useWorkerThreads?: boolean;
}
