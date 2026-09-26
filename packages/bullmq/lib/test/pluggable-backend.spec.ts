import { Test, TestingModule } from '@nestjs/testing';
import { Queue, Worker, FlowProducer } from 'bullmq';
import { BullModule, getQueueToken, getFlowProducerToken } from '../index.js';

const queueCtorSpy = vi.fn();
const workerCtorSpy = vi.fn();
const flowProducerCtorSpy = vi.fn();

vi.mock('bullmq', async (importOriginal) => {
  const actual = await importOriginal<typeof import('bullmq')>();
  return {
    ...actual,
    Queue: class {
      opts: any;
      constructor(name: string, opts?: any, backendFactory?: any) {
        this.opts = opts;
        queueCtorSpy(name, opts, backendFactory);
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
    FlowProducer: class {
      constructor(opts?: any, backendFactory?: any) {
        flowProducerCtorSpy(opts, backendFactory);
      }
      close = vi.fn().mockResolvedValue(undefined);
    },
  };
});

describe('Pluggable Backend (backendFactory)', () => {
  let moduleRef: TestingModule;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }
  });

  it('should pass backendFactory to Queue constructor when configured in registerQueue', async () => {
    const mockBackendFactory = vi.fn();
    const queueName = 'postgres-queue';

    moduleRef = await Test.createTestingModule({
      imports: [
        BullModule.registerQueue({
          name: queueName,
          connection: { host: 'localhost', port: 5432 },
          backendFactory: mockBackendFactory,
        }),
      ],
    }).compile();

    const queue = moduleRef.get<Queue>(getQueueToken(queueName));
    expect(queue).toBeDefined();
    expect(queueCtorSpy).toHaveBeenCalledWith(
      queueName,
      expect.objectContaining({
        name: queueName,
        backendFactory: mockBackendFactory,
      }),
      mockBackendFactory,
    );
  });

  it('should pass backendFactory to Worker constructor when configured in queue processors', async () => {
    const mockBackendFactory = vi.fn();
    const queueName = 'postgres-worker-queue';
    const processorCallback = vi.fn();

    moduleRef = await Test.createTestingModule({
      imports: [
        BullModule.registerQueue({
          name: queueName,
          backendFactory: mockBackendFactory,
          processors: [processorCallback],
        }),
      ],
    }).compile();

    const queue = moduleRef.get<Queue>(getQueueToken(queueName));
    expect(queue).toBeDefined();
    expect(workerCtorSpy).toHaveBeenCalledWith(
      queueName,
      processorCallback,
      expect.anything(),
      mockBackendFactory,
    );
  });

  it('should pass backendFactory to FlowProducer constructor when configured in registerFlowProducer', async () => {
    const mockBackendFactory = vi.fn();
    const flowName = 'postgres-flow';

    moduleRef = await Test.createTestingModule({
      imports: [
        BullModule.registerFlowProducer({
          name: flowName,
          connection: { host: 'localhost', port: 5432 },
          backendFactory: mockBackendFactory,
        }),
      ],
    }).compile();

    const flowProducer = moduleRef.get<FlowProducer>(
      getFlowProducerToken(flowName),
    );
    expect(flowProducer).toBeDefined();
    expect(flowProducerCtorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: flowName,
        backendFactory: mockBackendFactory,
      }),
      mockBackendFactory,
    );
  });

  it('should propagate backendFactory from root module options to registered queues', async () => {
    const mockBackendFactory = vi.fn();
    const queueName = 'inherited-backend-queue';

    moduleRef = await Test.createTestingModule({
      imports: [
        BullModule.forRoot({
          connection: { host: 'localhost', port: 5432 },
          backendFactory: mockBackendFactory,
        }),
        BullModule.registerQueue({
          name: queueName,
        }),
      ],
    }).compile();

    const queue = moduleRef.get<Queue>(getQueueToken(queueName));
    expect(queue).toBeDefined();
    expect(queueCtorSpy).toHaveBeenCalledWith(
      queueName,
      expect.objectContaining({
        name: queueName,
        backendFactory: mockBackendFactory,
      }),
      mockBackendFactory,
    );
  });
});
