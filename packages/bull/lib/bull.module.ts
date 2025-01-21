import {
  createConditionalDepHolder,
  IConditionalDepHolder,
} from '@nestjs/bull-shared';
import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { BullMetadataAccessor } from './bull-metadata.accessor';
import { BullExplorer } from './bull.explorer';
import {
  createQueueOptionProviders,
  createQueueProviders,
} from './bull.providers';
import {
  SharedBullAsyncConfiguration,
  SharedBullConfigurationFactory,
} from './interfaces';
import {
  BullModuleAsyncOptions,
  BullModuleOptions,
  BullOptionsFactory,
  BullRootModuleOptions,
} from './interfaces/bull-module-options.interface';
import {
  BULL_CONFIG_DEFAULT_TOKEN,
  getQueueOptionsToken,
  getSharedConfigToken,
} from './utils';

@Module({})
export class BullModule {
  private static coreModuleDefinition = {
    global: true,
    module: BullModule,
    imports: [DiscoveryModule],
    providers: [BullExplorer, BullMetadataAccessor],
  };

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

  static registerQueue(...options: BullModuleOptions[]): DynamicModule {
    const queueProviders = createQueueProviders([].concat(options));
    const queueOptionProviders = createQueueOptionProviders([].concat(options));
    return {
      module: BullModule,
      imports: [BullModule.coreModuleDefinition],
      providers: [...queueOptionProviders, ...queueProviders],
      exports: queueProviders,
    };
  }

  static registerQueueAsync(
    ...options: BullModuleAsyncOptions[]
  ): DynamicModule {
    const optionsArr = [].concat(options);
    const queueProviders = createQueueProviders(optionsArr);
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
    options: BullModuleAsyncOptions,
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
    asyncOptions: BullModuleAsyncOptions,
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
        optionsFactory: BullOptionsFactory,
      ) => {
        return {
          ...optionalDepHolder.getDependencyRef(asyncOptions.name),
          ...(await optionsFactory.createBullOptions()),
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
    const useClass = options.useClass;
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
    const inject = [options.useClass || options.useExisting];
    return {
      provide: getSharedConfigToken(configKey),
      useFactory: async (optionsFactory: SharedBullConfigurationFactory) =>
        optionsFactory.createSharedConfiguration(),
      inject,
    };
  }

  private static getUniqImports(
    options: Array<BullModuleAsyncOptions | SharedBullAsyncConfiguration>,
  ) {
    return (
      options
        .map((option) => option.imports)
        .reduce((acc, i) => acc.concat(i || []), [])
        .filter((v, i, a) => a.indexOf(v) === i) || []
    );
  }
}
