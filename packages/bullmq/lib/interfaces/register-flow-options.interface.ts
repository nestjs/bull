import { FactoryProvider, ModuleMetadata, Type } from '@nestjs/common';
import { QueueBaseOptions } from 'bullmq';
import { PartialThisParameter } from '../utils/partial-this-parameter.type';

/**
 * @publicApi
 */
export interface RegisterFlowProducerOptions
  extends PartialThisParameter<QueueBaseOptions, 'connection'> {
  /**
   * Flow name
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
   * When `true`, the flow will be force disconnected from Redis in the "onApplicationShutdown" lifecycle event.
   * Otherwise, the flow will be gracefully disconnected.
   * @default true
   */
  forceDisconnectOnShutdown?: boolean;
}

export interface RegisterFlowProducerOptionsFactory {
  createRegisterQueueOptions():
    | Promise<RegisterFlowProducerOptions>
    | RegisterFlowProducerOptions;
}

/**
 * @publicApi
 */
export interface RegisterFlowProducerAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  /**
   * Flow name.
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
  useExisting?: Type<RegisterFlowProducerOptionsFactory>;

  /**
   * Type (class name) of provider (instance to be registered and injected).
   */
  useClass?: Type<RegisterFlowProducerOptionsFactory>;

  /**
   * Factory function that returns an instance of the provider to be injected.
   */
  useFactory?: (
    ...args: any[]
  ) => Promise<RegisterFlowProducerOptions> | RegisterFlowProducerOptions;

  /**
   * Optional list of providers to be injected into the context of the Factory function.
   */
  inject?: FactoryProvider['inject'];
}
