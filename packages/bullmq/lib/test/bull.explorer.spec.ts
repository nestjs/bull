import { getQueueToken } from '@nestjs/bull-shared';
import { DiscoveryModule } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { Job, Queue } from 'bullmq';
import {
  Processor,
  QueueEventsHost,
  QueueEventsListener,
  WorkerHost,
} from '..';
import { BullMetadataAccessor } from '../bull-metadata.accessor';
import { BullExplorer } from '../bull.explorer';
import { BullModule } from '../bull.module';
import { getQueueSchedulerToken } from '../utils';

const workerCtorSpy = jest.fn();
const queueEventsSpy = jest.fn();
jest.mock('bullmq', () => ({
  Worker: class {
    constructor() {
      workerCtorSpy(...arguments);
    }
  },
  QueueEvents: class {
    constructor() {
      queueEventsSpy(...arguments);
    }

    close = jest.fn();
  },
}));

describe('BullExplorer', () => {
  let bullExplorer: BullExplorer;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [DiscoveryModule],
      providers: [BullExplorer, BullMetadataAccessor],
    }).compile();

    bullExplorer = moduleRef.get(BullExplorer);
  });
  afterAll(async () => {
    await moduleRef.close();
  });
  describe('handleProcessor', () => {
    const queueName = 'test_queue';
    const queue = {
      name: queueName,
      opts: {
        connection: {
          host: 'localhost',
          port: 6380,
        },
      },
    } as Partial<Queue>;

    @Processor(queueName)
    class FixtureProcessor extends WorkerHost {
      async process(job: Job<any, any, string>): Promise<any> {}
    }

    it('should instantiate Bull worker based on the processor class', () => {
      const instance = new FixtureProcessor();

      bullExplorer.handleProcessor(
        instance,
        queueName,
        queue.opts,
        null,
        false,
      );
      expect(workerCtorSpy).toHaveBeenCalledWith(
        queueName,
        expect.any(Function),
        expect.objectContaining({
          connection: queue.opts.connection,
        }),
      );
      expect(instance.worker).not.toBeUndefined();
    });
    it('should instantiate Bull worker with the appropriate worker options', () => {
      const workerOptions = { concurrency: 3 };

      @Processor(queueName, workerOptions)
      class ProcessorWithConcurrency extends WorkerHost {
        async process(job: Job<any, any, string>): Promise<any> {}
      }

      const instance = new ProcessorWithConcurrency();

      bullExplorer.handleProcessor(
        instance as any,
        queueName,
        queue.opts,
        null,
        false,
        workerOptions,
      );

      expect(workerCtorSpy).toHaveBeenCalledWith(
        queueName,
        expect.any(Function),
        expect.objectContaining({
          concurrency: 3,
          connection: queue.opts.connection,
        }),
      );
    });
  });

  describe('registerQueueEventListeners', () => {
    const queueName = 'test_queue';

    @QueueEventsListener(queueName)
    class EventsListener extends QueueEventsHost {}

    it('should instantiate Bull queue events classes', async () => {
      const mockQueue = {
        name: queueName,
        opts: {
          connection: {
            host: 'localhost',
            port: 6380,
          },
        },
      };
      moduleRef = await Test.createTestingModule({
        imports: [DiscoveryModule],
        providers: [BullExplorer, BullMetadataAccessor, EventsListener],
      }).compile();

      bullExplorer = moduleRef.get(BullExplorer);

      jest
        .spyOn(bullExplorer, 'getQueueOptions')
        .mockReturnValue(mockQueue.opts);
      bullExplorer.registerQueueEventListeners();

      expect(queueEventsSpy).toHaveBeenCalledWith(
        queueName,
        expect.objectContaining(mockQueue.opts),
      );
    });
  });

  describe('getQueueOptions', () => {
    it('should return options associated with the given queue', async () => {
      const queueToken = getQueueToken('test');
      const queueOptions = {
        connection: {
          host: 'localhost',
          port: 65793,
        },
        sharedConnection: true,
      };
      const moduleRef = await Test.createTestingModule({
        imports: [BullModule.registerQueue({ name: 'test', ...queueOptions })],
      })
        .overrideProvider(queueToken)
        .useValue({
          opts: queueOptions,
        })
        .overrideProvider(getQueueSchedulerToken('test'))
        .useValue(null)
        .compile();

      const explorer = moduleRef.get(BullExplorer);

      const queueOpts = explorer.getQueueOptions(queueToken, 'test');
      expect(queueOpts).toBeDefined();
      expect(queueOpts).toEqual(queueOptions);

      await moduleRef.close();
    });
  });
});
