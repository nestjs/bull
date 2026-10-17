import { Job } from 'bullmq';
import { URL } from 'url';
import {
  BullQueueAdvancedProcessor,
  BullQueueAdvancedSeparateProcessor,
} from './interfaces/bull-processor.interfaces.js';

export type BullQueueProcessor =
  | BullQueueProcessorCallback
  | BullQueueAdvancedProcessor
  | BullQueueSeparateProcessor
  | BullQueueAdvancedSeparateProcessor;

export type BullQueueProcessorCallback = (job: Job) => Promise<unknown>;

export type BullQueueSeparateProcessor = string | URL;

/**
 * Pluggable backend factory for BullMQ (introduced in BullMQ v6 for backends like PostgreSQL).
 * Structural fallback type ensures backwards compatibility with older BullMQ peer dependencies.
 *
 * @publicApi
 */
export type BullMQBackendFactory = (queueBase: any) => any;
