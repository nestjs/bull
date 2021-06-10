import { Injectable, Type } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  BULL_MODULE_ON_GLOBAL_QUEUE_EVENT,
  BULL_MODULE_ON_QUEUE_EVENT,
  BULL_MODULE_QUEUE,
  BULL_MODULE_QUEUE_PROCESS,
} from './bull.constants';
import { BullQueueEventOptions } from './bull.types';
import { ProcessOptions } from './decorators';

@Injectable()
export class BullMetadataAccessor {
  constructor(private readonly reflector: Reflector) {}

  isQueueComponent(target: Type<any> | Function): boolean {
    if (!target) {
      return false;
    }
    return !!this.reflector.get(BULL_MODULE_QUEUE, target);
  }

  isProcessor(target: Type<any> | Function): boolean {
    if (!target) {
      return false;
    }
    return !!this.reflector.get(BULL_MODULE_QUEUE_PROCESS, target);
  }

  isListener(target: Type<any> | Function): boolean {
    if (!target) {
      return false;
    }
    return !!this.reflector.get(BULL_MODULE_ON_QUEUE_EVENT, target);
  }

  isGlobalListener(target: Type<any> | Function): boolean {
    if (!target) {
      return false;
    }
    return !!this.reflector.get(BULL_MODULE_ON_GLOBAL_QUEUE_EVENT, target);
  }

  getQueueComponentMetadata(target: Type<any> | Function): any {
    return this.reflector.get(BULL_MODULE_QUEUE, target);
  }

  getProcessMetadata(target: Type<any> | Function): ProcessOptions | undefined {
    return this.reflector.get(BULL_MODULE_QUEUE_PROCESS, target);
  }

  getListenerMetadata(
    target: Type<any> | Function,
  ): BullQueueEventOptions | undefined {
    return this.reflector.get(BULL_MODULE_ON_QUEUE_EVENT, target);
  }

  getGlobalListenerMetadata(
    target: Type<any> | Function,
  ): BullQueueEventOptions | undefined {
    return this.reflector.get(BULL_MODULE_ON_GLOBAL_QUEUE_EVENT, target);
  }
}
