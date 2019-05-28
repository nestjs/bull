import * as Bull from 'bull';
import {BullQueueProcessor, BullQueueProcessorCallback, BullQueueSeparateProcessor} from './bull.types';
import { ModuleMetadata, Type } from '@nestjs/common/interfaces';

export interface BullModuleOptions {
  name?: string;
  options?: Bull.QueueOptions;
  processors?: BullQueueProcessor[];
}

export interface BullModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  name?: string;
  useClass?: Type<BullModuleOptions>;
  useFactory?: (
    ...args: any[]
  ) => Promise<BullModuleOptions> | BullModuleOptions;
  inject?: any[];
}

export interface QueueProcessDecoratorOptions {
  name?: string;
  concurrency?: number;
}

export interface QueueDecoratorOptions {
  name?: string;
}

export interface BullQueueAdvancedProcessor {
  concurrency?: number;
  name?: string;
  callback: BullQueueProcessorCallback;
}

export interface BullQueueAdvancedSeparateProcessor {
  concurrency?: number;
  name?: string;
  path: BullQueueSeparateProcessor;
}
