import { Injectable, Type } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ON_QUEUE_EVENT_METADATA,
  ON_WORKER_EVENT_METADATA,
  PROCESSOR_METADATA,
  QUEUE_EVENTS_LISTENER_METADATA,
  WORKER_METADATA,
} from './bull.constants';
import {
  OnQueueEventMetadata,
  OnWorkerEventMetadata,
  ProcessorOptions,
  QueueEventsListenerOptions,
} from './decorators';
import { NestWorkerOptions } from './interfaces/worker-options.interface';

@Injectable()
export class BullMetadataAccessor {
  constructor(private readonly reflector: Reflector) {}

  isProcessor(target: Type<any> | Function): boolean {
    if (!target) {
      return false;
    }
    return !!this.reflector.get(PROCESSOR_METADATA, target);
  }

  isQueueEventsListener(target: Type<any> | Function): boolean {
    if (!target) {
      return false;
    }
    return !!this.reflector.get(QUEUE_EVENTS_LISTENER_METADATA, target);
  }

  getProcessorMetadata(
    target: Type<any> | Function,
  ): ProcessorOptions | undefined {
    return this.reflector.get(PROCESSOR_METADATA, target);
  }

  getWorkerOptionsMetadata(target: Type<any> | Function): NestWorkerOptions {
    return this.reflector.get(WORKER_METADATA, target) ?? {};
  }

  getOnQueueEventMetadata(
    target: Type<any> | Function,
  ): OnQueueEventMetadata | undefined {
    return this.reflector.get(ON_QUEUE_EVENT_METADATA, target);
  }

  getOnWorkerEventMetadata(
    target: Type<any> | Function,
  ): OnWorkerEventMetadata | undefined {
    return this.reflector.get(ON_WORKER_EVENT_METADATA, target);
  }

  getQueueEventsListenerMetadata(
    target: Type<any> | Function,
  ): QueueEventsListenerOptions | undefined {
    return this.reflector.get(QUEUE_EVENTS_LISTENER_METADATA, target);
  }
}
