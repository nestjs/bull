import { DynamicModule, Module, Provider } from '@nestjs/common';
import { BullModuleOptions, BullModuleAsyncOptions } from './bull.interfaces';
import {
  createQueuesProviders,
  createAsyncQueuesProviders,
} from './bull.providers';

@Module({})
export class BullModule {
  static forRoot(
    options: BullModuleOptions | BullModuleOptions[],
  ): DynamicModule {
    const providers = createQueuesProviders([].concat(options));
    return {
      module: BullModule,
      providers: [ ...providers.configs, ...providers.queues ],
      exports: providers.queues.map(f => f.provide),
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
