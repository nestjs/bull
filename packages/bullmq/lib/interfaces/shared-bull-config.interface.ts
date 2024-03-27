import { FactoryProvider, ModuleMetadata, Type } from '@nestjs/common';
import * as Bull from 'bullmq';

export interface BullModuleExtraOptions {
  /**
   * option for manually registering processors and event-listeners
   */
  manualRegistration?: boolean;
}
export interface BullRootModuleOptions extends Bull.QueueOptions {
  extraOptions?: BullModuleExtraOptions;
}

export interface SharedBullConfigurationFactory {
  createSharedConfiguration():
    | Promise<BullRootModuleOptions>
    | BullRootModuleOptions;
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
  useClass?: Type<SharedBullConfigurationFactory>;

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

  /**
   * Extra options for the Bull module
   */
  extraOptions?: BullModuleExtraOptions;
}
