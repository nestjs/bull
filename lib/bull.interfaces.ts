import * as Bull from 'bull';
import {
  BullQueueProcessor,
  BullQueueProcessorCallback,
  BullQueueSeparateProcessor,
} from './bull.types';
import {
  ModuleMetadata,
  ClassProvider,
  FactoryProvider,
} from '@nestjs/common/interfaces';

export interface BullModuleOptions {
  name?: string;
  options?: Bull.QueueOptions;
  processors?: BullQueueProcessor[];
}

export interface BullModuleAsyncOptions {
  name?: string;
  imports?: ModuleMetadata['imports'];
  useClass?: ClassProvider<{
    options?: Bull.QueueOptions;
    processors?: BullQueueProcessor[];
  }>['useClass'];
  useFactory?: FactoryProvider<{
    options?: Bull.QueueOptions;
    processors?: BullQueueProcessor[];
  }>['useFactory'];
  inject?: FactoryProvider['inject'];
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
