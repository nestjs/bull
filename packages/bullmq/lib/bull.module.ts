import {
  createConditionalDepHolder,
  IConditionalDepHolder,
} from '@nestjs/bull-shared';
import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { FlowProducer, Queue, QueueBaseOptions, Worker } from 'bullmq';
import { BullMetadataAccessor } from './bull-metadata.accessor';
import { BULL_EXTRA_OPTIONS_TOKEN } from './bull.constants';
import { BullExplorer } from './bull.explorer';
import {
  createFlowProducerOptionProviders,
  createFlowProducerProviders,
  createQueueOptionProviders,
  createQueueProviders,
} from './bull.providers';
import { BullRegistrar } from './bull.registrar';
import { ProcessorDecoratorService } from './instrument/processor-decorator.service';
import {
  BullRootModuleOptions,
  RegisterFlowProducerAsyncOptions,
  RegisterFlowProducerOptions,
  RegisterFlowProducerOptionsFactory,
  SharedBullAsyncConfiguration,
  SharedBullConfigurationFactory,
} from './interfaces';
import {
  RegisterQueueAsyncOptions,
  RegisterQueueOptions,
  RegisterQueueOptionsFactory,
} from './interfaces/register-queue-options.interface';
import {
  BULL_CONFIG_DEFAULT_TOKEN,
  getFlowProducerOptionsToken,
  getQueueOptionsToken,
  getSharedConfigToken,
} from './utils';

/**
 * @publicApi
 */
@Module({})
export class BullModule {
  private static _queueClass: Type = Queue;
  private static _flowProducerClass: Type = FlowProducer;
  private static _workerClass: Type = Worker;
  private static coreModuleDefinition = {
    global: true,
    module: BullModule,
    imports: [DiscoveryModule],
    providers: [
      BullExplorer,
      BullMetadataAccessor,
      BullRegistrar,
      ProcessorDecoratorService,
    ],
    exports: [BullRegistrar],
  };

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
   * Class to be used to create Bull flow producers.
   * This configuration property can be used to instruct the "@nestjs/bullmq"
   * package to use, for example, "FlowProducerPro" class (from "BullMQ Pro").
   * @default FlowProducer
   */
  static set flowProducerClass(cls: Type) {
    this._flowProducerClass = cls;
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
  static forRoot(bullConfig: BullRootModuleOptions): DynamicModule;
  /**
   * Registers a globally available configuration under a specified "configKey".
   *
   * @param configKey a key under which the configuration should be available
   * @param sharedBullConfig shared bull configuration object
   */
  static forRoot(
    configKey: string,
    bullConfig: BullRootModuleOptions,
  ): DynamicModule;
  /**
   * Registers a globally available configuration for all queues
   * or using a specified "configKey" (if passed).
   *
   * @param keyOrConfig a key under which the configuration should be available or a bull configuration object
   * @param bullConfig bull configuration object
   */
  static forRoot(
    keyOrConfig: string | BullRootModuleOptions,
    bullConfig?: BullRootModuleOptions,
  ): DynamicModule {
    const [configKey, sharedBullConfig] =
      typeof keyOrConfig === 'string'
        ? [keyOrConfig, bullConfig]
        : [undefined, keyOrConfig];

    const { extraOptions, ...config } = sharedBullConfig;

    const sharedBullConfigProvider: Provider = {
      provide: getSharedConfigToken(configKey),
      useValue: config,
    };

    const extraOptionsProvider: Provider = {
      provide: BULL_EXTRA_OPTIONS_TOKEN,
      useValue: { ...extraOptions },
    };

    return {
      global: true,
      module: BullModule,
      providers: [sharedBullConfigProvider, extraOptionsProvider],
      exports: [sharedBullConfigProvider, extraOptionsProvider],
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
      providers: asyncSharedBullConfig.extraProviders
        ? [...providers, ...asyncSharedBullConfig.extraProviders]
        : providers,
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
    const queueOptionProviders = createQueueOptionProviders(optionsArr);

    return {
      module: BullModule,
      imports: [BullModule.coreModuleDefinition],
      providers: [...queueOptionProviders, ...queueProviders],
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

    const imports = this.getUniqImports(optionsArr);
    const asyncQueueOptionsProviders = options
      .map((queueOptions) => this.createAsyncProviders(queueOptions))
      .reduce((a, b) => a.concat(b), []);
    const extraProviders = options
      .map((queueOptions) => queueOptions.extraProviders)
      .filter((extraProviders) => extraProviders)
      .reduce((a, b) => a.concat(b), []);

    return {
      imports: imports.concat(BullModule.coreModuleDefinition),
      module: BullModule,
      providers: [
        ...asyncQueueOptionsProviders,
        ...queueProviders,
        ...extraProviders,
      ],
      exports: queueProviders,
    };
  }

  private static createAsyncProviders(
    options: RegisterQueueAsyncOptions,
  ): Provider[] {
    const optionalSharedConfigHolder = createConditionalDepHolder(
      getSharedConfigToken(options.configKey),
      BULL_CONFIG_DEFAULT_TOKEN,
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
    const useClass = options.useClass;
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
    optionalSharedConfigHolderRef: Type<
      IConditionalDepHolder<BullRootModuleOptions>
    >,
  ): Provider {
    if (asyncOptions.useFactory) {
      return {
        provide: getQueueOptionsToken(asyncOptions.name),
        useFactory: async (
          optionalDepHolder: IConditionalDepHolder<BullRootModuleOptions>,
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
    const inject = [asyncOptions.useClass || asyncOptions.useExisting];
    return {
      provide: getQueueOptionsToken(asyncOptions.name),
      useFactory: async (
        optionalDepHolder: IConditionalDepHolder<BullRootModuleOptions>,
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

  static registerFlowProducer(
    ...options: RegisterFlowProducerOptions[]
  ): DynamicModule {
    const optionsArr = [].concat(options);
    const flowProducerProviders = createFlowProducerProviders(
      optionsArr,
      this._flowProducerClass,
    );
    const flowProducerOptionProviders =
      createFlowProducerOptionProviders(optionsArr);

    return {
      module: BullModule,
      imports: [BullModule.coreModuleDefinition],
      providers: [...flowProducerOptionProviders, ...flowProducerProviders],
      exports: flowProducerProviders,
    };
  }

  static registerFlowProducerAsync(
    ...options: RegisterFlowProducerAsyncOptions[]
  ): DynamicModule {
    const optionsArr = [].concat(options);
    const flowProducerProviders = createFlowProducerProviders(
      optionsArr,
      this._flowProducerClass,
    );

    const imports = this.getUniqImports(optionsArr);
    const asyncFlowProducerOptionsProviders = options
      .map((flowProducerOptions) =>
        this.createAsyncFlowProducerProviders(flowProducerOptions),
      )
      .reduce((a, b) => a.concat(b), []);

    return {
      imports: imports.concat(BullModule.coreModuleDefinition),
      module: BullModule,
      providers: [
        ...asyncFlowProducerOptionsProviders,
        ...flowProducerProviders,
      ],
      exports: flowProducerProviders,
    };
  }

  private static createAsyncFlowProducerProviders(
    options: RegisterFlowProducerAsyncOptions,
  ): Provider[] {
    const optionalSharedConfigHolder = createConditionalDepHolder(
      getSharedConfigToken(options.configKey),
      BULL_CONFIG_DEFAULT_TOKEN,
    );

    if (options.useExisting || options.useFactory) {
      return [
        optionalSharedConfigHolder,
        this.createAsyncFlowProducerOptionsProvider(
          options,
          optionalSharedConfigHolder,
        ),
      ];
    }
    if (!options.useClass) {
      // fallback to the "registerFlowProducer" in case someone accidentally used the "registerFlowProducerAsync" instead
      return createFlowProducerOptionProviders([options]);
    }
    const useClass = options.useClass;
    return [
      optionalSharedConfigHolder,
      this.createAsyncFlowProducerOptionsProvider(
        options,
        optionalSharedConfigHolder,
      ),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncFlowProducerOptionsProvider(
    asyncOptions: RegisterFlowProducerAsyncOptions,
    optionalSharedConfigHolderRef: Type<
      IConditionalDepHolder<QueueBaseOptions>
    >,
  ): Provider {
    if (asyncOptions.useFactory) {
      return {
        provide: getFlowProducerOptionsToken(asyncOptions.name),
        useFactory: async (
          optionalDepHolder: IConditionalDepHolder<QueueBaseOptions>,
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
    const inject = [asyncOptions.useClass || asyncOptions.useExisting];
    return {
      provide: getFlowProducerOptionsToken(asyncOptions.name),
      useFactory: async (
        optionalDepHolder: IConditionalDepHolder<QueueBaseOptions>,
        optionsFactory: RegisterFlowProducerOptionsFactory,
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
    const { extraOptions, ...config } = options;

    const extraOptionsProvider: Provider = {
      provide: BULL_EXTRA_OPTIONS_TOKEN,
      useValue: { ...extraOptions },
    };

    if (options.useExisting || options.useFactory) {
      return [
        this.createAsyncSharedConfigurationProvider(configKey, config),
        extraOptionsProvider,
      ];
    }
    const useClass = config.useClass;
    return [
      this.createAsyncSharedConfigurationProvider(configKey, config),
      extraOptionsProvider,
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
    const inject = [options.useClass || options.useExisting];
    return {
      provide: getSharedConfigToken(configKey),
      useFactory: async (optionsFactory: SharedBullConfigurationFactory) =>
        optionsFactory.createSharedConfiguration(),
      inject,
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
