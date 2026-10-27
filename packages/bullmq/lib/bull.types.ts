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
 * Pluggable backend factory for BullMQ (for example, `createPostgresBackend`).
 * Requires bullmq 6 or later; earlier versions ignore it. Declared
 * structurally so that it compiles against every supported bullmq version.
 *
 * @publicApi
 */
export type BullMQBackendFactory = (
  name: string,
  opts: any,
  options?: any,
) => any;
