import {
  FactoryProvider,
  ModuleMetadata,
  Provider,
  Type,
} from '@nestjs/common';
import * as Bull from 'bullmq';

/**
 * @publicApi
 */
export interface BullModuleExtraOptions {
  /**
   * If set to true, the module will not register the Bull queues automatically.
   * This is useful when you want to manually register the queues.
   */
  manualRegistration?: boolean;
}

/**
 * @publicApi
 */
export interface BullRootModuleOptions extends Bull.QueueOptions {
  extraOptions?: BullModuleExtraOptions;
}

/**
 * @publicApi
 */
export interface SharedBullConfigurationFactory {
  createSharedConfiguration():
    | Promise<BullRootModuleOptions>
    | BullRootModuleOptions;
}

/**
 * @publicApi
 */
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
   * Extra options for the Bull module.
   */
  extraOptions?: BullModuleExtraOptions;

  /**
   * Extra providers to be registered in the module context.
   */
  extraProviders?: Provider[];
}
