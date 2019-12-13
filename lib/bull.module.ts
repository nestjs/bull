import { DynamicModule, Logger, Module, OnModuleInit } from '@nestjs/common';
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

@Module({
  imports: [DiscoveryModule],
  providers: [
    BullExplorer,
    BullMetadataAccessor,
    { provide: Logger, useValue: new Logger('BullModule') },
  ],
})
export class BullModule implements OnModuleInit {
  constructor(private readonly explorer: BullExplorer) {}

  static register(
    options: BullModuleOptions | BullModuleOptions[],
  ): DynamicModule {
    const queueProviders = createQueueProviders([].concat(options));
    const queueOptionProviders = createQueueOptionProviders([].concat(options));
    return {
      module: BullModule,
      providers: [...queueOptionProviders, ...queueProviders],
      exports: queueProviders,
    };
  }

  static registerAsync(
    options: BullModuleAsyncOptions | BullModuleAsyncOptions[],
  ): DynamicModule {
    const optionsArr = [].concat(options);
    const queueProviders = createQueueProviders(optionsArr);
    const queueOptionProviders = createAsyncQueueOptionsProviders(optionsArr);
    const imports = this.getUniqImports(optionsArr);

    return {
      imports,
      module: BullModule,
      providers: [...queueOptionProviders, ...queueProviders],
      exports: queueProviders,
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

  onModuleInit() {
    this.explorer.explore();
  }
}
