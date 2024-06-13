import { WorkerOptions } from 'bullmq';
import {
  BullQueueProcessorCallback,
  BullQueueSeparateProcessor,
} from '../bull.types';

export interface BullQueueAdvancedProcessor extends WorkerOptions {
  concurrency?: number;
  callback: BullQueueProcessorCallback;
}

export interface BullQueueAdvancedSeparateProcessor extends WorkerOptions {
  concurrency?: number;
  path: BullQueueSeparateProcessor;
  useWorkerThreads?: boolean;
}
