import * as Bull from 'bull';
import { Queue } from 'bull';
import { BullModuleOptions } from './bull.interfaces';
import { getQueueToken } from './bull.utils';

export function createQueues(options: BullModuleOptions[]): any[] {
  return options.map((option) => ({
    provide: getQueueToken(option.name),
    useFactory: (): Queue => {
      const queue: Queue = new Bull(option.name, option.options);
      option.processors.forEach((processor) => queue.process(processor));
      return queue;
    },
  }));
}
