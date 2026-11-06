import { Scope } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { Processor, ProcessorDecoratorService, WorkerHost } from '../index.js';
import { BullMetadataAccessor } from '../bull-metadata.accessor.js';
import { BullExplorer } from '../bull.explorer.js';
import { BullModule } from '../bull.module.js';

const workerInstances: unknown[] = [];
const workerCtorSpy = vi.fn();
vi.mock('bullmq', async (importOriginal) => {
  const actual = await importOriginal<typeof import('bullmq')>();
  return {
    ...actual,
    Worker: class {
      constructor() {
        workerCtorSpy(...arguments);
        workerInstances.push(this);
      }

      close = vi.fn();
    },
  };
});

@Processor({ name: 'request_scoped', scope: Scope.REQUEST })
class RequestScopedProcessor extends WorkerHost {
  async process(_job: Job<any, any, string>): Promise<any> {
    return this.worker;
  }
}

describe('Request-scoped processor', () => {
  let bullExplorer: BullExplorer;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        DiscoveryModule,
        BullModule.forRoot({ connection: {} }),
        BullModule.registerQueue({ name: 'request_scoped' }),
      ],
      providers: [
        BullExplorer,
        BullMetadataAccessor,
        RequestScopedProcessor,
        ProcessorDecoratorService,
      ],
    }).compile();

    bullExplorer = moduleRef.get(BullExplorer);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  it('should expose the worker inside "process" of a request-scoped processor', async () => {
    bullExplorer.registerWorkers();
    const processorFunction = workerCtorSpy.mock.calls[0][1];

    const worker = await processorFunction({ id: '1' });

    expect(worker).toBe(workerInstances[0]);
  });
});
