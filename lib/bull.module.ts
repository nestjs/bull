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
    const module: DynamicModule = {
      module: BullModule,
      providers: [],
      exports: []
    };
    const providers = createQueuesProviders([].concat(options));
    module.providers.push(...providers.configs, ...providers.queues);
    module.exports.push(...providers.queues.map(q => q.provide));
    return module;
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
