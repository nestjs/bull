import {DynamicModule, Module, Provider} from '@nestjs/common';
import {BullModuleOptions, BullModuleAsyncOptions} from './bull.interfaces';
import {createQueuesProviders, createAsyncQueuesProviders} from './bull.providers';

@Module({})
export class BullModule {

  static forRoot(options: BullModuleOptions | BullModuleOptions[]): DynamicModule {
    const providers: any[] = createQueuesProviders([].concat(options));
    return {
      module: BullModule,
      providers,
      exports: providers,
    };
  }

  static forRootAsync(options: BullModuleAsyncOptions): DynamicModule {
    const providers: Provider[] = createAsyncQueuesProviders([].concat(options));
    return {
      imports: options.imports,
      module: BullModule,
      providers,
      exports: providers,
    };
  }

}
