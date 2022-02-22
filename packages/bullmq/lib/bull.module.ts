import {
  createConditionalDepHolder,
  getQueueOptionsToken,
  getSharedConfigToken,
  IConditionalDepHolder,
} from '@nestjs/bull-internal';
import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { Queue, QueueOptions, Worker } from 'bullmq';
import { BullMetadataAccessor } from './bull-metadata.accessor';
import { BullExplorer } from './bull.explorer';
import {
  createQueueOptionProviders,
  createQueueProviders,
  createQueueSchedulerProviders,
} from './bull.providers';
import {
  SharedBullAsyncConfiguration,
  SharedBullConfigurationFactory,
} from './interfaces';
import {
  RegisterQueueAsyncOptions,
  RegisterQueueOptions,
  RegisterQueueOptionsFactory,
} from './interfaces/register-queue-options.interface';

@Module({})
export class BullModule {
  private static _queueClass: Type = Queue;
  private static _workerClass: Type = Worker;

  /**
   * Class to be used to create Bull queues.
   * This configuration property can be used to instruct the "@nestjs/bullmq"
   * package to use, for example, "QueuePro" class (from "BullMQ Pro").
   * @default Queue
   */
  static set queueClass(cls: Type) {
    this._queueClass = cls;
  }

  /**
   * Class to be used to create Bull workers.
   * This configuration property can be used to instruct the "@nestjs/bullmq"
   * package to use, for example, "WorkerPro" class (from "BullMQ Pro").
   * @default Worker
   */
  static set workerClass(cls: Type) {
    BullExplorer.workerClass = cls;
    this._workerClass = cls;
  }

  /**
   * Registers a globally available configuration for all queues.
   *
   * @param bullConfig shared bull configuration object
   */
  static forRoot(bullConfig: QueueOptions): DynamicModule;
  /**
   * Registers a globally available configuration under a specified "configKey".
   *
   * @param configKey a key under which the configuration should be available
   * @param sharedBullConfig shared bull configuration object
   */
  static forRoot(configKey: string, bullConfig: QueueOptions): DynamicModule;
  /**
   * Registers a globally available configuration for all queues
   * or using a specified "configKey" (if passed).
   *
   * @param keyOrConfig a key under which the configuration should be available or a bull configuration object
   * @param bullConfig bull configuration object
   */
  static forRoot(
    keyOrConfig: string | QueueOptions,
    bullConfig?: QueueOptions,
  ): DynamicModule {
    const [configKey, sharedBullConfig] =
      typeof keyOrConfig === 'string'
        ? [keyOrConfig, bullConfig]
        : [undefined, keyOrConfig];

    const sharedBullConfigProvider: Provider = {
      provide: getSharedConfigToken(configKey),
      useValue: sharedBullConfig,
    };

    return {
      global: true,
      module: BullModule,
      providers: [sharedBullConfigProvider],
      exports: [sharedBullConfigProvider],
    };
  }

  /**
   * Registers a globally available configuration for all queues.
   *
   * @param asyncBullConfig shared bull configuration async factory
   */
  static forRootAsync(
    asyncBullConfig: SharedBullAsyncConfiguration,
  ): DynamicModule;
  /**
   * Registers a globally available configuration under a specified "configKey".
   *
   * @param configKey a key under which the configuration should be available
   * @param asyncBullConfig shared bull configuration async factory
   */
  static forRootAsync(
    configKey: string,
    asyncBullConfig: SharedBullAsyncConfiguration,
  ): DynamicModule;
  /**
   * Registers a globally available configuration for all queues
   * or using a specified "configKey" (if passed).
   *
   * @param keyOrAsyncConfig a key under which the configuration should be available or a bull configuration object
   * @param asyncBullConfig shared bull configuration async factory
   */
  static forRootAsync(
    keyOrAsyncConfig: string | SharedBullAsyncConfiguration,
    asyncBullConfig?: SharedBullAsyncConfiguration,
  ): DynamicModule {
    const [configKey, asyncSharedBullConfig] =
      typeof keyOrAsyncConfig === 'string'
        ? [keyOrAsyncConfig, asyncBullConfig]
        : [undefined, keyOrAsyncConfig];

    const imports = this.getUniqImports([asyncSharedBullConfig]);
    const providers = this.createAsyncSharedConfigurationProviders(
      configKey,
      asyncSharedBullConfig,
    );

    return {
      global: true,
      module: BullModule,
      imports,
      providers,
      exports: providers,
    };
  }

  static registerQueue(...options: RegisterQueueOptions[]): DynamicModule {
    const optionsArr = [].concat(options);
    const queueProviders = createQueueProviders(
      optionsArr,
      this._queueClass,
      this._workerClass,
    );
    const queueSchedulerProviders = createQueueSchedulerProviders(optionsArr);
    const queueOptionProviders = createQueueOptionProviders(optionsArr);

    return {
      module: BullModule,
      imports: [BullModule.registerCore()],
      providers: [
        ...queueOptionProviders,
        ...queueProviders,
        ...queueSchedulerProviders,
      ],
      exports: queueProviders,
    };
  }

  static registerQueueAsync(
    ...options: RegisterQueueAsyncOptions[]
  ): DynamicModule {
    const optionsArr = [].concat(options);
    const queueProviders = createQueueProviders(
      optionsArr,
      this._queueClass,
      this._workerClass,
    );
    const queueSchedulerProviders = createQueueSchedulerProviders(optionsArr);

    const imports = this.getUniqImports(optionsArr);
    const asyncQueueOptionsProviders = options
      .map((queueOptions) => this.createAsyncProviders(queueOptions))
      .reduce((a, b) => a.concat(b), []);

    return {
      imports: imports.concat(BullModule.registerCore()),
      module: BullModule,
      providers: [
        ...asyncQueueOptionsProviders,
        ...queueProviders,
        ...queueSchedulerProviders,
      ],
      exports: queueProviders,
    };
  }

  private static createAsyncProviders(
    options: RegisterQueueAsyncOptions,
  ): Provider[] {
    const optionalSharedConfigHolder = createConditionalDepHolder(
      getSharedConfigToken(options.configKey),
    );

    if (options.useExisting || options.useFactory) {
      return [
        optionalSharedConfigHolder,
        this.createAsyncOptionsProvider(options, optionalSharedConfigHolder),
      ];
    }
    if (!options.useClass) {
      // fallback to the "registerQueue" in case someone accidentally used the "registerQueueAsync" instead
      return createQueueOptionProviders([options]);
    }
    const useClass = options.useClass as Type<RegisterQueueOptionsFactory>;
    return [
      optionalSharedConfigHolder,
      this.createAsyncOptionsProvider(options, optionalSharedConfigHolder),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    asyncOptions: RegisterQueueAsyncOptions,
    optionalSharedConfigHolderRef: Type<IConditionalDepHolder<QueueOptions>>,
  ): Provider {
    if (asyncOptions.useFactory) {
      return {
        provide: getQueueOptionsToken(asyncOptions.name),
        useFactory: async (
          optionalDepHolder: IConditionalDepHolder<QueueOptions>,
          ...factoryArgs: unknown[]
        ) => {
          return {
            ...optionalDepHolder.getDependencyRef(asyncOptions.name),
            ...(await asyncOptions.useFactory(...factoryArgs)),
          };
        },
        inject: [optionalSharedConfigHolderRef, ...(asyncOptions.inject || [])],
      };
    }
    // `as Type<BullOptionsFactory>` is a workaround for microsoft/TypeScript#31603
    const inject = [
      (asyncOptions.useClass ||
        asyncOptions.useExisting) as Type<RegisterQueueOptionsFactory>,
    ];
    return {
      provide: getQueueOptionsToken(asyncOptions.name),
      useFactory: async (
        optionalDepHolder: IConditionalDepHolder<QueueOptions>,
        optionsFactory: RegisterQueueOptionsFactory,
      ) => {
        return {
          ...optionalDepHolder.getDependencyRef(asyncOptions.name),
          ...(await optionsFactory.createRegisterQueueOptions()),
        };
      },
      inject: [optionalSharedConfigHolderRef, ...inject],
    };
  }

  private static createAsyncSharedConfigurationProviders(
    configKey: string | undefined,
    options: SharedBullAsyncConfiguration,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncSharedConfigurationProvider(configKey, options)];
    }
    const useClass = options.useClass as Type<SharedBullConfigurationFactory>;
    return [
      this.createAsyncSharedConfigurationProvider(configKey, options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncSharedConfigurationProvider(
    configKey: string | undefined,
    options: SharedBullAsyncConfiguration,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: getSharedConfigToken(configKey),
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    // `as Type<SharedBullConfigurationFactory>` is a workaround for microsoft/TypeScript#31603
    const inject = [
      (options.useClass ||
        options.useExisting) as Type<SharedBullConfigurationFactory>,
    ];
    return {
      provide: getSharedConfigToken(configKey),
      useFactory: async (optionsFactory: SharedBullConfigurationFactory) =>
        optionsFactory.createSharedConfiguration(),
      inject,
    };
  }

  private static registerCore() {
    return {
      global: true,
      module: BullModule,
      imports: [DiscoveryModule],
      providers: [BullExplorer, BullMetadataAccessor],
    };
  }

  private static getUniqImports(
    options: Array<RegisterQueueAsyncOptions | SharedBullAsyncConfiguration>,
  ) {
    return (
      options
        .map((option) => option.imports)
        .reduce((acc, i) => acc.concat(i || []), [])
        .filter((v, i, a) => a.indexOf(v) === i) || []
    );
  }
}
