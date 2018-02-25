import * as Bull from 'bull';
import { BullQueueProcessor } from './bull.types';

export interface BullModuleOptions {
  name?: string;
  options?: Bull.QueueOptions;
  processors?: BullQueueProcessor[];
}
