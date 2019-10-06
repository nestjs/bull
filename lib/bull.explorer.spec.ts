import { BullExplorer } from './bull.explorer';
import { Queue, QueueProcess, OnQueueEvent } from './bull.decorators';
import { BullQueueEvents } from './bull.enums';
import { Test } from '@nestjs/testing';
import { BullModule } from './bull.module';
import { ModuleRef, ModulesContainer } from '@nestjs/core';
import { getQueueToken } from './bull.utils';

describe('BullExplorer', () => {
  describe('explore', () => {
    // TODO
  });

  describe('handleProcessor', () => {
    it('should add the given function to the queue handlers', () => {
      const instance = { handler: jest.fn() };
      const queue = { process: jest.fn() };
      BullExplorer.handleProcessor(instance, 'handler', queue);
      expect(queue.process).toHaveBeenCalledWith(expect.any(Function));
    });
    it('should add the given function to the queue handlers with concurrency', () => {
      const instance = { handler: jest.fn() };
      const queue = { process: jest.fn() };
      const opts = { concurrency: 42 };
      BullExplorer.handleProcessor(instance, 'handler', queue, opts);
      expect(queue.process).toHaveBeenCalledWith(
        opts.concurrency,
        expect.any(Function),
      );
    });
    it('should add the given function to the queue handlers with name', () => {
      const instance = { handler: jest.fn() };
      const queue = { process: jest.fn() };
      const opts = { name: 'test' };
      BullExplorer.handleProcessor(instance, 'handler', queue, opts);
      expect(queue.process).toHaveBeenCalledWith(
        opts.name,
        expect.any(Function),
      );
    });
    it('should add the given function to the queue handlers with concurrency and name', () => {
      const instance = { handler: jest.fn() };
      const queue = { process: jest.fn() };
      const opts = { name: 'test', concurrency: 42 };
      BullExplorer.handleProcessor(instance, 'handler', queue, opts);
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
      const queue = { on: jest.fn() };
      const opts = { eventName: 'test' };
      BullExplorer.handleListener(instance, 'handler', queue, opts);
      expect(queue.on).toHaveBeenCalledWith(
        opts.eventName,
        expect.any(Function),
      );
    });
  });

  describe('isQueueComponent', () => {
    it('should return true if the given class is a queue component', () => {
      @Queue()
      class MyQueue {}
      expect(BullExplorer.isQueueComponent(MyQueue)).toBe(true);
    });
    it('should return false if the given class is not queue component', () => {
      class TestClass {}
      expect(BullExplorer.isQueueComponent(TestClass)).toBe(false);
    });
  });

  describe('getQueueComponentMetadata', () => {
    it('should return the given queue component metadata', () => {
      const opts = { name: 'test' };
      @Queue(opts)
      class MyQueue {
        processor() {}
      }
      expect(BullExplorer.getQueueComponentMetadata(MyQueue)).toBe(opts);
    });
  });

  describe('isProcessor', () => {
    it('should return true if the given class property is a queue processor', () => {
      class MyQueue {
        @QueueProcess()
        processor() {}
      }
      const myQueueInstance = new MyQueue();
      expect(BullExplorer.isProcessor(myQueueInstance.processor)).toBe(true);
    });
    it('should return false if the given class property is not a queue processor', () => {
      class MyQueue {
        processor() {}
      }
      const myQueueInstance = new MyQueue();
      expect(BullExplorer.isProcessor(myQueueInstance.processor)).toBe(false);
    });
  });

  describe('getProcessorMetadata', () => {
    it('should return the given queue processor metadata', () => {
      const opts = { concurrency: 42, name: 'test' };
      class MyQueue {
        @QueueProcess(opts)
        processor() {}
      }
      const myQueueInstance = new MyQueue();
      expect(BullExplorer.getProcessorMetadata(myQueueInstance.processor)).toBe(
        opts,
      );
    });
  });

  describe('isListener', () => {
    it('should return true if the given class property is a queue listener', () => {
      class MyQueue {
        @OnQueueEvent(BullQueueEvents.COMPLETED)
        listener() {}
      }
      const myQueueInstance = new MyQueue();
      expect(BullExplorer.isListener(myQueueInstance.listener)).toBe(true);
    });
    it('should return false if the given class property is not a queue listener', () => {
      class MyQueue {
        listener() {}
      }
      const myQueueInstance = new MyQueue();
      expect(BullExplorer.isListener(myQueueInstance.listener)).toBe(false);
    });
  });

  describe('getListenerMetadata', () => {
    it('should return the given queue listener metadata', () => {
      const opts = { eventName: BullQueueEvents.COMPLETED };
      class MyQueue {
        @OnQueueEvent(opts.eventName)
        listener() {}
      }
      const myQueueInstance = new MyQueue();
      expect(
        BullExplorer.getListenerMetadata(myQueueInstance.listener),
      ).toHaveProperty('eventName');
      expect(
        BullExplorer.getListenerMetadata(myQueueInstance.listener).eventName,
      ).toBe(opts.eventName);
    });
    it('should return the given queue listener metadata with specified job name', () => {
      const opts = { eventName: BullQueueEvents.COMPLETED, name: 'test' };
      class MyQueue {
        @OnQueueEvent(opts)
        listener() {}
      }
      const myQueueInstance = new MyQueue();
      const metadata = BullExplorer.getListenerMetadata(
        myQueueInstance.listener,
      );
      expect(metadata).toHaveProperty('eventName');
      expect(metadata).toHaveProperty('name');
      expect(metadata.eventName).toBe(opts.eventName);
      expect(metadata.name).toBe(opts.name);
    });
    it('should return the given queue listener metadata with specified job id', () => {
      const opts = { eventName: BullQueueEvents.COMPLETED, id: '1' };
      class MyQueue {
        @OnQueueEvent(opts)
        listener() {}
      }
      const myQueueInstance = new MyQueue();
      const metadata = BullExplorer.getListenerMetadata(
        myQueueInstance.listener,
      );
      expect(metadata).toHaveProperty('eventName');
      expect(metadata).toHaveProperty('id');
      expect(metadata.eventName).toBe(opts.eventName);
      expect(metadata.id).toBe(opts.id);
    });
  });

  describe('getQueue', () => {
    it('should return the queue matching the given token', async () => {
      const queueToken = getQueueToken('test');
      const fakeQueue = 'I am a fake queue';
      const module = await Test.createTestingModule({
        imports: [BullModule.forRoot({ name: 'test' })],
      })
        .overrideProvider(queueToken)
        .useValue(fakeQueue)
        .compile();
      const moduleRef = module.get(ModuleRef);
      const queue = BullExplorer.getQueue(moduleRef, queueToken);
      expect(queue).toBeDefined();
      expect(queue).toBe(fakeQueue);
    });
  });

  describe('getQueueComponents', () => {
    it('should return the queue components of the module', async () => {
      @Queue()
      class MyQueue {}
      const module = await Test.createTestingModule({
        imports: [BullModule.forRoot({})],
        providers: [MyQueue],
      }).compile();
      const queueComponent = module.get(MyQueue);
      const container = module.get(ModulesContainer);
      const foundComponents = BullExplorer.getQueueComponents([
        ...container.values(),
      ]);
      expect(foundComponents).toBeInstanceOf(Array);
      expect(foundComponents.length).toBe(1);
      expect(
        foundComponents
          .map(({ instance }) => instance)
          .includes(queueComponent),
      ).toBe(true);
    });
  });
});
