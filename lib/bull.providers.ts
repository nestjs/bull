import * as Bull from 'bull';
import {Queue} from 'bull';
import { BullOptions } from './bull.interfaces';
import { getQueueToken } from './bull.utils';

export function createQueues(options: BullOptions[]): any[] {
  return options.map((option) => ({
    provide: getQueueToken(option.name),
    useFactory: (): Queue => {
      const queue: Queue = new Bull(option.name, option.options);
      option.processors.forEach((processor) => queue.process(processor));
      return queue;
    },
  }));
}
