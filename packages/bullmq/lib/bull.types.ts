import { Job } from 'bullmq';
import { URL } from 'url';
import {
  BullQueueAdvancedProcessor,
  BullQueueAdvancedSeparateProcessor,
} from './interfaces/bull-processor.interfaces';

export type BullQueueProcessor =
  | BullQueueProcessorCallback
  | BullQueueAdvancedProcessor
  | BullQueueSeparateProcessor
  | BullQueueAdvancedSeparateProcessor;

export type BullQueueProcessorCallback = (job: Job) => Promise<unknown>;

export type BullQueueSeparateProcessor = string | URL;
