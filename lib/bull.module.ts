import { DynamicModule, Module } from '@nestjs/common';
import { BullOptions } from './bull.interfaces';
import { createQueues } from './bull.providers';

@Module({})
export class BullModule {

  static forRoot(options: BullOptions | BullOptions[]): DynamicModule {
    const providers: any[] = createQueues([].concat(options));
    return {
      module: BullModule,
      components: providers,
      exports: providers,
    };
  }

}
