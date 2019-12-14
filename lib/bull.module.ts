import { DynamicModule, Logger, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { BullMetadataAccessor } from './bull-metadata.accessor';
import { BullExplorer } from './bull.explorer';
import {
  createAsyncQueueOptionsProviders,
  createQueueOptionProviders,
  createQueueProviders,
} from './bull.providers';
import {
  BullModuleAsyncOptions,
  BullModuleOptions,
} from './interfaces/bull-module-options.interface';

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
    const queueOptionProviders = createAsyncQueueOptionsProviders(optionsArr);
    const imports = this.getUniqImports(optionsArr);

    return {
      global: true,
      imports: imports.concat(BullModule.forRoot()),
      module: BullModule,
      providers: [...queueOptionProviders, ...queueProviders],
      exports: queueProviders,
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
