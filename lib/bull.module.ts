import {DynamicModule, Module} from '@nestjs/common';
import {BullModuleOptions, BullModuleAsyncOptions} from './bull.interfaces';
import {createQueueOptionProviders, createQueueProviders, createAsyncQueueOptionsProviders} from './bull.providers';

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

  static forRootAsync(options: BullModuleAsyncOptions | BullModuleAsyncOptions[]): DynamicModule {
    const optionsArr = [].concat(options);
    const queueProviders = createQueueProviders(optionsArr);
    const queueOptionProviders = createAsyncQueueOptionsProviders(optionsArr);
    const imports = optionsArr
        .map(option => option.imports)
        .reduce((acc = [], i) => { acc.push(i); }) || [];
    return {
      imports,
      module: BullModule,
      providers: [ ...queueOptionProviders, ...queueProviders ],
      exports: queueProviders
    };
  }
}
