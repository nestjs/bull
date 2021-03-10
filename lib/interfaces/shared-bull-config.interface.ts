import {
  FactoryProvider,
  ModuleMetadata,
  Type,
} from '@nestjs/common/interfaces';
import * as Bull from 'bull';
import { BullOptionsFactory } from './bull-module-options.interface';

export interface SharedBullConfigurationFactory {
  createSharedConfiguration(): Promise<Bull.QueueOptions> | Bull.QueueOptions;
}

export interface SharedBullAsyncConfiguration
  extends Pick<ModuleMetadata, 'imports'> {
  /**
   * Existing Provider to be used.
   */
  useExisting?: Type<SharedBullConfigurationFactory>;

  /**
   * Type (class name) of provider (instance to be registered and injected).
   */
  useClass?: Type<BullOptionsFactory>;

  /**
   * Factory function that returns an instance of the provider to be injected.
   */
  useFactory?: (
    ...args: any[]
  ) => Promise<Bull.QueueOptions> | Bull.QueueOptions;

  /**
   * Optional list of providers to be injected into the context of the Factory function.
   */
  inject?: FactoryProvider['inject'];
}
