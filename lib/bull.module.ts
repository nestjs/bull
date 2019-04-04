import {DynamicModule, Module} from '@nestjs/common';
import {BullModuleOptions, BullModuleAsyncOptions} from './bull.interfaces';
import {createQueueOptionProviders, createQueueProviders, createAsyncQueueOptionsProviders,} from './bull.providers';

@Module({})
export class BullModule {
  static forRoot(
      options: BullModuleOptions | BullModuleOptions[],
  ): DynamicModule {
    const queueProviders = createQueueProviders([].concat(options));
    const queueOptionProviders = createQueueOptionProviders([].concat(options));
    return {
      module: BullModule,
      providers: [ ...queueOptionProviders, ...queueProviders ],
      exports: queueProviders
    };
  }

  static forRootAsync(options: BullModuleAsyncOptions): DynamicModule {
    const queueProviders = createQueueProviders([].concat(options));
    const queueOptionProviders = createAsyncQueueOptionsProviders([].concat(options));
    return {
      imports: options.imports,
      module: BullModule,
      providers: [ ...queueOptionProviders, ...queueProviders ],
      exports: queueProviders
    };
  }
}
