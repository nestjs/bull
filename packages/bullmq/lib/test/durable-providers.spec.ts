import { Inject, Injectable, Scope } from '@nestjs/common';
import {
  ContextIdFactory,
  createContextId,
  DiscoveryModule,
  REQUEST,
} from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { Processor, ProcessorDecoratorService, WorkerHost } from '..';
import { BullMetadataAccessor } from '../bull-metadata.accessor';
import { BullExplorer } from '../bull.explorer';
import { BullModule } from '../bull.module';

const workerCtorSpy = jest.fn();
const queueEventsSpy = jest.fn();
jest.mock('bullmq', () => ({
  Worker: class {
    constructor() {
      workerCtorSpy(...arguments);
    }

    close = jest.fn();
  },
  QueueEvents: class {
    constructor() {
      queueEventsSpy(...arguments);
    }

    close = jest.fn();
  },
}));

@Injectable({ scope: Scope.REQUEST, durable: true })
class DurableDependency {
  static counter = 0;
  public readonly counter: number;
  constructor(@Inject(REQUEST) public readonly job: any) {
    this.counter = DurableDependency.counter;
    DurableDependency.counter++;
  }
}

@Injectable({ scope: Scope.REQUEST, durable: false })
class NonDurableDependency {
  static counter = 0;
  public readonly counter: number;
  constructor() {
    this.counter = NonDurableDependency.counter;
    NonDurableDependency.counter++;
  }
}

@Processor({ scope: Scope.REQUEST })
class ProcessorWithDurableDependency extends WorkerHost {
  constructor(
    private readonly durableDependency: DurableDependency,
    private readonly nonDurableDependency: NonDurableDependency,
  ) {
    super();
  }
  async process(job: Job<any, any, string>, token?: string): Promise<any> {
    return [this.durableDependency, this.nonDurableDependency];
  }
}

describe('BullExplorer', () => {
  let bullExplorer: BullExplorer;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        DiscoveryModule,
        BullModule.forRoot({ connection: {} }),
        BullModule.registerQueue(),
      ],
      providers: [
        BullExplorer,
        BullMetadataAccessor,
        DurableDependency,
        NonDurableDependency,
        ProcessorWithDurableDependency,
        ProcessorDecoratorService,
      ],
    }).compile();

    bullExplorer = moduleRef.get(BullExplorer);
  });
  afterAll(async () => {
    await moduleRef.close();
  });
  describe('registerWorkers', () => {
    const durableContextId = createContextId();
    const mockJobRefId = 'X';

    beforeAll(async () => {
      ContextIdFactory.apply({
        attach: (contextId, _request) => ({
          resolve: (info) => {
            return info.isTreeDurable ? durableContextId : contextId;
          },
          payload: _request,
        }),
      });
    });

    afterAll(() => {
      // Clear the context id strategy by creating a strategy that does nothing.
      ContextIdFactory.apply({
        attach: (contextId, _request) => (_info) => contextId,
      });
    });

    it('should load durable processor dependencies', async () => {
      bullExplorer.registerWorkers();
      const processorFunction = workerCtorSpy.mock.calls[0][1];
      expect(processorFunction).toBeDefined();

      const [durable1, nonDurable1] = await processorFunction(mockJobRefId);
      const [durable2, nonDurable2] = await processorFunction(mockJobRefId);

      expect(durable1).toBe(durable2);
      expect(nonDurable1).not.toBe(nonDurable2);
    });

    it('should inject the request dependency', async () => {
      const durableDependency = await moduleRef.resolve(
        DurableDependency,
        durableContextId,
      );
      expect(durableDependency.job).toBe(mockJobRefId);
    });
  });
});
