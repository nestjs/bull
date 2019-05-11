import {BullExplorer} from './bull.explorer';
import {Queue, QueueProcess, OnQueueEvent} from './bull.decorators';
import {BullQueueEvents} from './bull.enums';

describe('BullExplorer', () => {
  describe('explore', () => {});

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
      class TestClass {}
      Queue()(TestClass);
      expect(BullExplorer.isQueueComponent(TestClass)).toBe(true);
    });
    it('should return false if the given class is not queue component', () => {
      class TestClass {}
      expect(BullExplorer.isQueueComponent(TestClass)).toBe(false);
    });
  });

  describe('getQueueComponentMetadata', () => {
    it('should return the given queue component metadata', () => {
      class TestClass {}
      const opts = { name: 'test' };
      Queue(opts)(TestClass);
      expect(BullExplorer.getQueueComponentMetadata(TestClass)).toBe(opts);
    });
  });

  describe('isProcessor', () => {
    it('should return true if the given class property is a queue processor', () => {
      const obj = { processor: jest.fn() };
      QueueProcess()(
        obj,
        'processor',
        Object.getOwnPropertyDescriptor(obj, 'processor'),
      );
      expect(BullExplorer.isProcessor(obj, 'processor')).toBe(true);
    });
    it('should return false if the given class property is not a queue processor', () => {
      const obj = { processor: jest.fn() };
      expect(BullExplorer.isProcessor(obj, 'processor')).toBe(false);
    });
  });

  describe('getProcessorMetadata', () => {
    it('should return the given queue processor metadata', () => {
      const obj = { processor: jest.fn() };
      const opts = { concurrency: 42, name: 'test' };
      QueueProcess(opts)(
        obj,
        'processor',
        Object.getOwnPropertyDescriptor(obj, 'processor'),
      );
      expect(BullExplorer.getProcessorMetadata(obj, 'processor')).toBe(opts);
    });
  });

  describe('isListener', () => {
    it('should return true if the given class property is a queue listener', () => {
      const obj = { listener: jest.fn() };
      OnQueueEvent(BullQueueEvents.COMPLETED)(
        obj,
        'listener',
        Object.getOwnPropertyDescriptor(obj, 'listener'),
      );
      expect(BullExplorer.isListener(obj, 'listener')).toBe(true);
    });
    it('should return false if the given class property is not a queue listener', () => {
      const obj = { listener: jest.fn() };
      expect(BullExplorer.isListener(obj, 'listener')).toBe(false);
    });
  });

  describe('getListenerMetadata', () => {
    it('should return the given queue listener metadata', () => {
      const obj = { listener: jest.fn() };
      const opts = { eventName: BullQueueEvents.COMPLETED };
      OnQueueEvent(opts.eventName)(
        obj,
        'listener',
        Object.getOwnPropertyDescriptor(obj, 'listener'),
      );
      expect(BullExplorer.getListenerMetadata(obj, 'listener')).toHaveProperty(
        'eventName',
      );
      expect(BullExplorer.getListenerMetadata(obj, 'listener').eventName).toBe(
        opts.eventName,
      );
    });
  });

  describe('getQueue', () => {
    // TODO
  });

  describe('getQueueComponents', () => {
    // TODO
  });
});
