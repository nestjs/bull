import * as Bull from 'bull';
import { BullQueueProcessor } from './bull.types';
import { ModuleMetadata, Type } from '@nestjs/common/interfaces';

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

export interface PatternProperties {
  pattern: string;
  methodKey: string;
  targetCallback: (...args: any[]) => any;
}