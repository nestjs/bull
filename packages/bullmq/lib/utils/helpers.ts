import {
  BullQueueProcessor,
  BullQueueProcessorCallback,
  BullQueueSeparateProcessor,
} from '../bull.types.js';
import {
  BullQueueAdvancedProcessor,
  BullQueueAdvancedSeparateProcessor,
} from '../interfaces/bull-processor.interfaces.js';
import { URL } from 'url';

export function isProcessorCallback(
  processor: BullQueueProcessor,
): processor is BullQueueProcessorCallback {
  return 'function' === typeof processor;
}

export function isAdvancedProcessor(
  processor: BullQueueProcessor,
): processor is BullQueueAdvancedProcessor {
  return (
    'object' === typeof processor &&
    !!(processor as BullQueueAdvancedProcessor).callback &&
    isProcessorCallback((processor as BullQueueAdvancedProcessor).callback)
  );
}

export function isSeparateProcessor(
  processor: BullQueueProcessor,
): processor is BullQueueSeparateProcessor {
  return 'string' === typeof processor || processor instanceof URL;
}

export function isAdvancedSeparateProcessor(
  processor: BullQueueProcessor,
): processor is BullQueueAdvancedSeparateProcessor {
  return (
    'object' === typeof processor &&
    !!(processor as BullQueueAdvancedSeparateProcessor).path &&
    isSeparateProcessor((processor as BullQueueAdvancedSeparateProcessor).path)
  );
}

/**
 * Returns the status of the underlying connection in a version-agnostic way.
 * In bullmq v6, the "connection" property was removed from the high-level
 * classes (Queue, FlowProducer, etc.) in favor of the "getBackend()" method,
 * while in earlier versions the connection was exposed directly as a property.
 */
export async function getConnectionStatus(
  instance: unknown,
): Promise<string | undefined> {
  try {
    // bullmq v6+
    if (typeof (instance as any).getBackend === 'function') {
      const backend = (instance as any).getBackend();
      // "client" is only exposed by the Redis backend
      const client = await backend?.client;
      return client?.status;
    }
    // bullmq v3-v5
    return (instance as any).connection?.status;
  } catch {
    return undefined;
  }
}
