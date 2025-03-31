import {
  FactoryProvider,
  ModuleMetadata,
  Provider,
  Type,
} from '@nestjs/common';
import { QueueOptions } from 'bullmq';
import { BullQueueProcessor } from '../bull.types';
import { PartialThisParameter } from '../utils/partial-this-parameter.type';

/**
 * @publicApi
 */
export interface RegisterQueueOptions
  extends PartialThisParameter<QueueOptions, 'connection'> {
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

  /**
   * @deprecated
   * This option is not supported in BullMQ 5 and considered a bad practice in prior versions.
   * */
  sharedConnection?: boolean;

  /**
   * When `true`, the queue will be force disconnected from Redis in the "onApplicationShutdown" lifecycle event.
   * Otherwise, the queue will be gracefully disconnected.
   * @default false
   */
  forceDisconnectOnShutdown?: boolean;
}

/**
 * @publicApi
 */
export interface RegisterQueueOptionsFactory {
  createRegisterQueueOptions():
    | Promise<RegisterQueueOptions>
    | RegisterQueueOptions;
}

/**
 * @publicApi
 */
export interface RegisterQueueAsyncOptions
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
  useExisting?: Type<RegisterQueueOptionsFactory>;

  /**
   * Type (class name) of provider (instance to be registered and injected).
   */
  useClass?: Type<RegisterQueueOptionsFactory>;

  /**
   * Factory function that returns an instance of the provider to be injected.
   */
  useFactory?: (
    ...args: any[]
  ) => Promise<RegisterQueueOptions> | RegisterQueueOptions;

  /**
   * Optional list of providers to be injected into the context of the Factory function.
   */
  inject?: FactoryProvider['inject'];

  /**
   * Extra providers to be registered in the module context.
   */
  extraProviders?: Provider[];
}
