import * as Bull from 'bull';
import { BullQueueProcessor } from './bull.types';

export interface BullOptions {
  name: string;
  options?: Bull.QueueOptions;
  processors?: BullQueueProcessor[];
}
