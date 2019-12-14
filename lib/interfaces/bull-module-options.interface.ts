import {
  FactoryProvider,
  ModuleMetadata,
  Type,
} from '@nestjs/common/interfaces';
import * as Bull from 'bull';
import { BullQueueProcessor } from '../bull.types';

export interface BullModuleOptions extends Bull.QueueOptions {
  name?: string;
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
  inject?: FactoryProvider['inject'];
}
