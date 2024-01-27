import { FactoryProvider, ModuleMetadata, Type } from '@nestjs/common';
import { QueueOptions } from 'bullmq';
import { BullQueueProcessor } from '../bull.types';
import { PartialThisParameter } from '../utils/partial-this-parameter.type';

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
   * @deperecated
   * This option is not supported in BullMQ 5 and considered a bad practice in prior versions.
   * */
  sharedConnection?: boolean;
}

export interface RegisterQueueOptionsFactory {
  createRegisterQueueOptions():
    | Promise<RegisterQueueOptions>
    | RegisterQueueOptions;
}

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
}
