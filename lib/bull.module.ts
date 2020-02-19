import { DynamicModule, Logger, Module, Provider, Type } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { BullMetadataAccessor } from './bull-metadata.accessor';
import { BullExplorer } from './bull.explorer';
import {
  createQueueOptionProviders,
  createQueueProviders,
} from './bull.providers';
import {
  BullModuleAsyncOptions,
  BullModuleOptions,
  BullOptionsFactory,
} from './interfaces/bull-module-options.interface';
import { getQueueOptionsToken } from './utils/get-queue-options-token.util';

@Module({})
export class BullModule {
  static registerQueue(...options: BullModuleOptions[]): DynamicModule {
    const queueProviders = createQueueProviders([].concat(options));
    const queueOptionProviders = createQueueOptionProviders([].concat(options));
    return {
      module: BullModule,
      imports: [BullModule.forRoot()],
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
      .map(queueOptions => this.createAsyncProviders(queueOptions))
      .reduce((a, b) => a.concat(b), []);

    return {
      imports: imports.concat(BullModule.forRoot()),
      module: BullModule,
      providers: [...asyncQueueOptionsProviders, ...queueProviders],
      exports: queueProviders,
    };
  }

  private static createAsyncProviders(
    options: BullModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const useClass = options.useClass as Type<BullOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: BullModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: getQueueOptionsToken(options.name),
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    // `as Type<BullOptionsFactory>` is a workaround for microsoft/TypeScript#31603
    const inject = [
      (options.useClass || options.useExisting) as Type<BullOptionsFactory>,
    ];
    return {
      provide: getQueueOptionsToken(options.name),
      useFactory: async (optionsFactory: BullOptionsFactory) =>
        optionsFactory.createBullOptions(),
      inject,
    };
  }

  private static forRoot() {
    return {
      global: true,
      module: BullModule,
      imports: [DiscoveryModule],
      providers: [
        BullExplorer,
        BullMetadataAccessor,
        { provide: Logger, useValue: new Logger('BullModule') },
      ],
    };
  }

  private static getUniqImports(options: BullModuleAsyncOptions[]) {
    return (
      options
        .map(option => option.imports)
        .reduce((acc, i) => acc.concat(i || []), [])
        .filter((v, i, a) => a.indexOf(v) === i) || []
    );
  }
}
