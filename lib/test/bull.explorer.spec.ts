import { Test } from '@nestjs/testing';
import { BullExplorer } from '../bull.explorer';
import { BullModule } from '../bull.module';
import { getQueueToken } from '../utils';

describe('bullExplorer', () => {
  let bullExplorer: BullExplorer;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [BullModule.registerQueue({ name: 'test' })],
    }).compile();

    bullExplorer = moduleRef.get(BullExplorer);
  });
  describe('handleProcessor', () => {
    it('should add the given function to the queue handlers', () => {
      const instance = { handler: jest.fn() };
      const queue = { process: jest.fn() } as any;
      bullExplorer.handleProcessor(instance, 'handler', queue);
      expect(queue.process).toHaveBeenCalledWith(expect.any(Function));
    });
    it('should add the given function to the queue handlers with concurrency', () => {
      const instance = { handler: jest.fn() };
      const queue = { process: jest.fn() } as any;
      const opts = { concurrency: 42 };
      bullExplorer.handleProcessor(instance, 'handler', queue, opts);
      expect(queue.process).toHaveBeenCalledWith(
        opts.concurrency,
        expect.any(Function),
      );
    });
    it('should add the given function to the queue handlers with name', () => {
      const instance = { handler: jest.fn() };
      const queue = { process: jest.fn() } as any;
      const opts = { name: 'test' };
      bullExplorer.handleProcessor(instance, 'handler', queue, opts);
      expect(queue.process).toHaveBeenCalledWith(
        opts.name,
        expect.any(Function),
      );
    });
    it('should add the given function to the queue handlers with concurrency and name', () => {
      const instance = { handler: jest.fn() };
      const queue = { process: jest.fn() } as any;
      const opts = { name: 'test', concurrency: 42 };

      bullExplorer.handleProcessor(instance, 'handler', queue, opts);
      expect(queue.process).toHaveBeenCalledWith(
        opts.name,
        opts.concurrency,
        expect.any(Function),
      );
    });
  });

  describe('handleListener', () => {
    it('should add the given function to the queue listeners for the given event', () => {
      const instance = { handler: jest.fn() };
      const queue = { on: jest.fn() } as any;
      const opts = { eventName: 'test' } as any;

      bullExplorer.handleListener(instance, 'handler', queue, opts);
      expect(queue.on).toHaveBeenCalledWith(
        opts.eventName,
        expect.any(Function),
      );
    });
  });

  describe('getQueue', () => {
    it('should return the queue matching the given token', async () => {
      const queueToken = getQueueToken('test');
      const fakeQueue = 'I am a fake queue';

      const moduleRef = await Test.createTestingModule({
        imports: [BullModule.registerQueue({ name: 'test' })],
      })
        .overrideProvider(queueToken)
        .useValue(fakeQueue)
        .compile();

      const explorer = moduleRef.get(BullExplorer);

      const queue = explorer.getQueue(queueToken, 'test');
      expect(queue).toBeDefined();
      expect(queue).toBe(fakeQueue);
    });
  });
});
