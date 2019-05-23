import { BullExplorer } from './bull.explorer';
import { Queue, QueueProcess, OnQueueEvent } from './bull.decorators';
import { BullQueueEvents } from './bull.enums';

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
  });

  describe('getQueue', () => {
    // TODO
  });

  describe('getQueueComponents', () => {
    // TODO
  });
});
