// A type-only import: bullmq 5 (still in the CI matrix) has no
// `createPostgresBackend` export, so it must not be imported at runtime.
import type { createPostgresBackend } from 'bullmq';
import type { BullMQBackendFactory } from '../bull.types.js';
import type {
  BullQueueAdvancedProcessor,
  BullQueueAdvancedSeparateProcessor,
  BullRootModuleOptions,
  NestQueueEventOptions,
  NestWorkerOptions,
  RegisterFlowProducerOptions,
  RegisterQueueOptions,
} from '../interfaces/index.js';

type PostgresBackendFactory = typeof createPostgresBackend;

// These assignments are checked by `tsc -p tsconfig.spec.json`; at runtime
// they only hold a stub.
describe('BullMQBackendFactory', () => {
  it("should accept bullmq's createPostgresBackend in every backendFactory option", () => {
    const factory = vi.fn() as unknown as PostgresBackendFactory;

    const backendFactory: BullMQBackendFactory = factory;
    const root: BullRootModuleOptions['backendFactory'] = factory;
    const queue: RegisterQueueOptions['backendFactory'] = factory;
    const flowProducer: RegisterFlowProducerOptions['backendFactory'] = factory;
    const processor: BullQueueAdvancedProcessor['backendFactory'] = factory;
    const separateProcessor: BullQueueAdvancedSeparateProcessor['backendFactory'] =
      factory;
    const worker: NestWorkerOptions['backendFactory'] = factory;
    const queueEvents: NestQueueEventOptions['backendFactory'] = factory;

    expect([
      backendFactory,
      root,
      queue,
      flowProducer,
      processor,
      separateProcessor,
      worker,
      queueEvents,
    ]).toEqual(Array(8).fill(factory));
  });
});
