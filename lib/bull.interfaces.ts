import * as Bull from 'bull';
import {
  BullQueueProcessor,
  BullQueueProcessorCallback,
  BullQueueSeparateProcessor,
} from './bull.types';
import { ModuleMetadata, Type } from '@nestjs/common/interfaces';

// @see https://stackoverflow.com/a/49725198
export type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> &
      Partial<Record<Exclude<Keys, K>, undefined>>
  }[Keys];

export interface BullModuleOptions {
  name?: string;
  options?: Bull.QueueOptions;
  processors?: BullQueueProcessor[];
}

export interface BullOptionsFactory {
  createBullOptions(): Promise<BullModuleOptions> | BullModuleOptions;
}

export interface BullModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  name?: string;
  useExisting?: Type<BullOptionsFactory>;
  useClass?: Type<BullOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<BullModuleOptions> | BullModuleOptions;
  inject?: any[];
}

export interface QueueProcessDecoratorOptions {
  name?: string;
  concurrency?: number;
}

export type QueueEventDecoratorOptions = RequireOnlyOne<
  { id?: string; name?: string },
  'id' | 'name'
>;

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
