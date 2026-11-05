import { Test, TestingModule } from '@nestjs/testing';
import { BullModule, BullQueueProcessorCallback } from '../index.js';

const workerCtorSpy = vi.fn();

vi.mock('bullmq', async (importOriginal) => {
  const actual = await importOriginal<typeof import('bullmq')>();
  return {
    ...actual,
    Queue: class {
      opts: any;
      constructor(name: string, opts?: any) {
        this.opts = opts;
      }
      close = vi.fn().mockResolvedValue(undefined);
    },
    Worker: class {
      constructor(
        name: string,
        processor?: any,
        opts?: any,
        backendFactory?: any,
      ) {
        workerCtorSpy(name, processor, opts, backendFactory);
      }
      close = vi.fn().mockResolvedValue(undefined);
    },
  };
});

describe('Queue processors', () => {
  const queueName = 'telemetry-queue';
  const telemetry = { tracer: {}, contextManager: {} } as any;
  let moduleRef: TestingModule;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }
  });

  it('should pass telemetry from the queue options to every worker', async () => {
    const callback = vi.fn() as BullQueueProcessorCallback;
    const path = '/path/to/processor.js';

    moduleRef = await Test.createTestingModule({
      imports: [
        BullModule.registerQueue({
          name: queueName,
          telemetry,
          processors: [
            callback,
            path,
            { callback, concurrency: 2 },
            { path, concurrency: 2 },
          ],
        }),
      ],
    }).compile();

    expect(workerCtorSpy).toHaveBeenCalledTimes(4);
    for (const [, , opts] of workerCtorSpy.mock.calls) {
      expect(opts).toEqual(expect.objectContaining({ telemetry }));
    }
  });

  it('should pass telemetry from the root options to every worker', async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        BullModule.forRoot({ connection: {}, telemetry }),
        BullModule.registerQueue({
          name: queueName,
          processors: [vi.fn() as BullQueueProcessorCallback],
        }),
      ],
    }).compile();

    expect(workerCtorSpy).toHaveBeenCalledWith(
      queueName,
      expect.any(Function),
      expect.objectContaining({ telemetry }),
      undefined,
    );
  });
});
