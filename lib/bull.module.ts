import {DynamicModule, Module, Provider} from '@nestjs/common';
import {BullModuleOptions, BullModuleAsyncOptions} from './bull.interfaces';
import {createAsyncQueuesProviders, createQueueOptionProviders, createQueueProviders,} from './bull.providers';

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
    const providers: Provider[] = createAsyncQueuesProviders(
        [].concat(options),
    );
    return {
      imports: options.imports,
      module: BullModule,
      providers,
      exports: providers,
    };
  }
}
