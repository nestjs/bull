import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Job, Queue } from 'bullmq';
import {
  BullModule,
  getQueueToken,
  InjectQueue,
  Processor,
  WorkerHost,
} from '../lib/index.js';

vi.setConfig({ testTimeout: 15000 });

const connection = { host: '0.0.0.0', port: 6380, db: 1 };

describe('Shutdown', () => {
  // A job that is still running when the application closes should finish
  // against open queues: the worker drains it before any queue is closed.
  it('should let an active job add to another queue while the app closes', async () => {
    const sourceName = 'shutdown_source';
    const targetName = 'shutdown_target';

    let releaseJob!: () => void;
    const jobReleased = new Promise<void>((resolve) => (releaseJob = resolve));
    let jobStarted!: () => void;
    const started = new Promise<void>((resolve) => (jobStarted = resolve));
    const outcome: { added?: boolean; error?: string } = {};

    @Processor(sourceName)
    class SourceProcessor extends WorkerHost {
      constructor(@InjectQueue(targetName) private readonly target: Queue) {
        super();
      }

      async process(job: Job): Promise<void> {
        jobStarted();
        await jobReleased;
        try {
          await this.target.add('child', { parent: job.id });
          outcome.added = true;
        } catch (err) {
          outcome.error = (err as Error).message;
        }
      }
    }

    @Module({
      imports: [
        BullModule.registerQueue(
          { name: sourceName, connection },
          { name: targetName, connection },
        ),
      ],
      providers: [SourceProcessor],
    })
    class AppModule {}

    const app = await NestFactory.createApplicationContext(AppModule, {
      logger: false,
    });
    const source = app.get<Queue>(getQueueToken(sourceName));
    const target = app.get<Queue>(getQueueToken(targetName));
    await target.obliterate({ force: true });

    // Release the job once the target queue has been closed, or after a grace
    // period if the application waits for the job first.
    const closeTarget = target.close.bind(target);
    target.close = async () => {
      await closeTarget();
      releaseJob();
    };
    setTimeout(() => releaseJob(), 1000).unref();

    await source.add('parent', {});
    await started;
    await app.close();

    expect(outcome).toEqual({ added: true });

    const check = new Queue(targetName, { connection });
    expect(await check.getJobCounts('wait')).toEqual({ wait: 1 });
    await check.obliterate({ force: true });
    await check.close();
  });
});
