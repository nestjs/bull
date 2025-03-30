import {
  FactoryProvider,
  ModuleMetadata,
  Provider,
  Type,
} from '@nestjs/common';
import * as Bull from 'bull';
import { BullQueueProcessor } from '../bull.types';

/**
 * @publicApi
 */
export interface BullRootModuleOptions extends Bull.QueueOptions {
  /**
   * Redis client connection string
   */
  url?: string;
}

/**
 * @publicApi
 */
export interface BullModuleOptions extends BullRootModuleOptions {
  /**
   * Queue name
   *
   * @default default
   */
  name?: string;

  /**
   * Shared configuration key
   *
   * @default default
   */
  configKey?: string;

  /**
   * Additional queue processors
   */
  processors?: BullQueueProcessor[];
}

/**
 * @publicApi
 */
export interface BullOptionsFactory {
  createBullOptions(): Promise<BullModuleOptions> | BullModuleOptions;
}

/**
 * @publicApi
 */
export interface BullModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  /**
   * Queue name.
   *
   * @default default
   */
  name?: string;

  /**
   * Shared configuration key.
   */
  configKey?: string;

  /**
   * Existing Provider to be used.
   */
  useExisting?: Type<BullOptionsFactory>;

  /**
   * Type (class name) of provider (instance to be registered and injected).
   */
  useClass?: Type<BullOptionsFactory>;

  /**
   * Factory function that returns an instance of the provider to be injected.
   */
  useFactory?: (
    ...args: any[]
  ) => Promise<BullModuleOptions> | BullModuleOptions;

  /**
   * Optional list of providers to be injected into the context of the Factory function.
   */
  inject?: FactoryProvider['inject'];

  /**
   * Extra providers to be registered in the module context.
   */
  extraProviders?: Provider[];
}
