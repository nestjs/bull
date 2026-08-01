import { DiscoveryModule } from '@nestjs/core';
import { Module } from '@nestjs/core/injector/module.js';
import { Test, TestingModule } from '@nestjs/testing';
import { Job, Queue } from 'bullmq';
import {
  getQueueToken,
  Processor,
  ProcessorDecoratorService,
  QueueEventsHost,
  QueueEventsListener,
  WorkerHost,
} from '..';
import { BullMetadataAccessor } from '../bull-metadata.accessor.js';
import { BullExplorer } from '../bull.explorer.js';
import { BullModule } from '../bull.module.js';
import { getFlowProducerToken } from '../utils/index.js';

const workerCtorSpy = vi.fn();
const queueEventsSpy = vi.fn();
vi.mock('bullmq', async (importOriginal) => {
  const actual = await importOriginal<typeof import('bullmq')>();
  return {
    ...actual,
    Worker: class {
      constructor() {
        workerCtorSpy(...arguments);
      }
    },
    QueueEvents: class {
      constructor() {
        queueEventsSpy(...arguments);
      }

      close = vi.fn();
    },
  };
});

describe('BullExplorer', () => {
  let bullExplorer: BullExplorer;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [DiscoveryModule],
      providers: [
        BullExplorer,
        BullMetadataAccessor,
        ProcessorDecoratorService,
      ],
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
      opts: { connection: { host: 'localhost', port: 6380 } },
    } as Partial<Queue>;

    @Processor(queueName)
    class FixtureProcessor extends WorkerHost {
      async process(job: Job<any, any, string>, token?: string): Promise<any> {}
    }

    it('should instantiate Bull worker based on the processor class', () => {
      const instance = new FixtureProcessor();

      bullExplorer.handleProcessor(
        instance,
        queueName,
        queue.opts,
        null as unknown as Module,
        false,
      );
      expect(workerCtorSpy).toHaveBeenCalledWith(
        queueName,
        expect.any(Function),
        expect.objectContaining({ connection: queue.opts.connection }),
      );
      expect(instance.worker).not.toBeUndefined();
    });

    it('should instantiate Bull worker with the appropriate worker options', () => {
      const workerOptions = { concurrency: 3 };

      @Processor(queueName, workerOptions)
      class ProcessorWithConcurrency extends WorkerHost {
        async process(
          job: Job<any, any, string>,
          token?: string,
        ): Promise<any> {}
      }

      const instance = new ProcessorWithConcurrency();

      bullExplorer.handleProcessor(
        instance as any,
        queueName,
        queue.opts,
        null as unknown as Module,
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
    it('should pass telemetry option to the worker constructor', () => {
      const instance = new FixtureProcessor();

      // Create a mock telemetry object that satisfies the Telemetry interface
      const mockTelemetry = {
        instrumentJob: vi.fn(),
        tracer: {
          startSpan: vi.fn(),
          currentSpan: vi.fn(),
          withSpan: vi.fn(),
          withContext: vi.fn(),
          bind: vi.fn(),
        } as any, // Cast to any to bypass type checking for tracer
        contextManager: {
          active: vi.fn(),
          with: vi.fn(),
          bind: vi.fn(),
          getMetadata: vi.fn(),
          fromMetadata: vi.fn(),
        } as any, // Cast to any to bypass type checking for contextManager
      };

      // Add telemetry to queue options
      const queueOptsWithTelemetry = {
        ...queue.opts,
        telemetry: mockTelemetry,
      };

      bullExplorer.handleProcessor(
        instance,
        queueName,
        queueOptsWithTelemetry,
        null as unknown as Module,
        false,
      );

      expect(workerCtorSpy).toHaveBeenCalledWith(
        queueName,
        expect.any(Function),
        expect.objectContaining({
          connection: queue.opts.connection,
          telemetry: mockTelemetry,
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
        opts: { connection: { host: 'localhost', port: 6380 } },
      };
      moduleRef = await Test.createTestingModule({
        imports: [DiscoveryModule],
        providers: [
          BullExplorer,
          BullMetadataAccessor,
          EventsListener,
          ProcessorDecoratorService,
        ],
      }).compile();

      bullExplorer = moduleRef.get(BullExplorer);

      vi.spyOn(bullExplorer, 'getQueueOptions').mockReturnValue(mockQueue.opts);
      bullExplorer.registerQueueEventListeners();

      expect(queueEventsSpy).toHaveBeenCalledWith(
        queueName,
        expect.objectContaining(mockQueue.opts),
      );
    });
    it('should pass telemetry option to queue events constructor', async () => {
      const mockTelemetry = {
        instrumentJob: vi.fn(),
        tracer: {
          startSpan: vi.fn(),
          currentSpan: vi.fn(),
          withSpan: vi.fn(),
          withContext: vi.fn(),
          bind: vi.fn(),
        } as any,
        contextManager: {
          active: vi.fn(),
          with: vi.fn(),
          bind: vi.fn(),
          getMetadata: vi.fn(),
          fromMetadata: vi.fn(),
        } as any,
      };

      const mockQueue = {
        name: queueName,
        opts: {
          connection: { host: 'localhost', port: 6380 },
          telemetry: mockTelemetry,
        },
      };

      moduleRef = await Test.createTestingModule({
        imports: [DiscoveryModule],
        providers: [
          BullExplorer,
          BullMetadataAccessor,
          EventsListener,
          ProcessorDecoratorService,
        ],
      }).compile();

      bullExplorer = moduleRef.get(BullExplorer);

      vi.spyOn(bullExplorer, 'getQueueOptions').mockReturnValue(mockQueue.opts);
      bullExplorer.registerQueueEventListeners();

      expect(queueEventsSpy).toHaveBeenCalledWith(
        queueName,
        expect.objectContaining({
          connection: mockQueue.opts.connection,
          telemetry: mockTelemetry,
        }),
      );
    });
  });

  describe('getQueueOptions', () => {
    it('should return options associated with the given queue', async () => {
      const queueToken = getQueueToken('test');
      const queueOptions = {
        connection: { host: 'localhost', port: 65793 },
        sharedConnection: true,
      };
      const moduleRef = await Test.createTestingModule({
        imports: [BullModule.registerQueue({ name: 'test', ...queueOptions })],
      })
        .overrideProvider(queueToken)
        .useValue({ opts: queueOptions })
        .compile();

      const explorer = moduleRef.get(BullExplorer);

      const queueOpts = explorer.getQueueOptions(queueToken, 'test');
      expect(queueOpts).toBeDefined();
      expect(queueOpts).toEqual(queueOptions);

      await moduleRef.close();
    });
  });

  describe('getFlowProducerOptions', () => {
    it('should return options associated with the given flowProducer', async () => {
      const flowProducerToken = getFlowProducerToken('test');
      const flowProducerOptions = {
        connection: { host: 'localhost', port: 65793 },
        sharedConnection: true,
      };
      const moduleRef = await Test.createTestingModule({
        imports: [
          BullModule.registerFlowProducer({
            name: 'test',
            ...flowProducerOptions,
          }),
        ],
      })
        .overrideProvider(flowProducerToken)
        .useValue({ opts: flowProducerOptions })
        .compile();

      const explorer = moduleRef.get(BullExplorer);

      const flowProducerOpts = explorer.getFlowProducerOptions(
        flowProducerToken,
        'test',
      );
      expect(flowProducerOpts).toBeDefined();
      expect(flowProducerOpts).toEqual(flowProducerOptions);

      await moduleRef.close();
    });
  });
});
