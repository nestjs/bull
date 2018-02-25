import { DynamicModule, Module } from '@nestjs/common';
import { BullModuleOptions } from './bull.interfaces';
import { createQueues } from './bull.providers';

@Module({})
export class BullModule {

  static forRoot(options: BullModuleOptions | BullModuleOptions[]): DynamicModule {
    const providers: any[] = createQueues([].concat(options));
    return {
      module: BullModule,
      components: providers,
      exports: providers,
    };
  }

}
