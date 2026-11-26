import { getQueueToken } from '@nestjs/bull-shared';
import { Inject, Injectable, Scope } from '@nestjs/common';
import {
  ContextIdFactory,
  createContextId,
  DiscoveryModule,
  REQUEST,
} from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bull';
import { Process } from '../decorators/process.decorator.js';
import { Processor } from '../decorators/processor.decorator.js';
import { BullMetadataAccessor } from '../bull-metadata.accessor.js';
import { BullExplorer } from '../bull.explorer.js';

@Injectable({ scope: Scope.REQUEST, durable: true })
class DurableDependency {
  constructor(@Inject(REQUEST) public readonly job: any) {}
}

@Injectable({ scope: Scope.REQUEST, durable: false })
class NonDurableDependency {}

@Processor({ scope: Scope.REQUEST })
class ProcessorWithDurableDependency {
  constructor(
    private readonly durableDependency: DurableDependency,
    private readonly nonDurableDependency: NonDurableDependency,
  ) {}

  @Process()
  process(job: Job) {
    return [this.durableDependency, this.nonDurableDependency];
  }
}

describe('BullExplorer (durable providers)', () => {
  const queue = { process: vi.fn() };
  let bullExplorer: BullExplorer;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [DiscoveryModule],
      providers: [
        BullExplorer,
        BullMetadataAccessor,
        DurableDependency,
        NonDurableDependency,
        ProcessorWithDurableDependency,
        { provide: getQueueToken(), useValue: queue },
      ],
    }).compile();

    bullExplorer = moduleRef.get(BullExplorer);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  describe('explore', () => {
    const durableContextId = createContextId();
    const mockJobRef = { id: 'X' };

    beforeAll(() => {
      ContextIdFactory.apply({
        attach: (contextId, _request) => ({
          resolve: (info) =>
            info.isTreeDurable ? durableContextId : contextId,
          payload: _request,
        }),
      });
    });

    afterAll(() => {
      // Reset the strategy to one that does nothing.
      ContextIdFactory.apply({
        attach: (contextId) => () => contextId,
      });
    });

    it('should reuse durable processor dependencies across jobs', async () => {
      queue.process.mockClear();
      bullExplorer.explore();
      const processorFunction = queue.process.mock.calls[0][0];
      expect(processorFunction).toBeDefined();

      const [durable1, nonDurable1] = await processorFunction(mockJobRef);
      const [durable2, nonDurable2] = await processorFunction(mockJobRef);

      expect(durable1).toBe(durable2);
      expect(durable1.job).toBe(mockJobRef);
      expect(nonDurable1).not.toBe(nonDurable2);
    });
  });
});
