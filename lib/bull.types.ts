import { DoneCallback, Job } from 'bull';

export type BullQueueProcessor = ((job: Job, done?: DoneCallback) => void);
