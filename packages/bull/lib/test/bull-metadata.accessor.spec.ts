import { Reflector } from '@nestjs/core';
import { OnQueueEvent, Process, Processor } from '..';
import { BullMetadataAccessor } from '../bull-metadata.accessor';
import { BullQueueEvents } from '../enums';

describe('BullMetadataAccessor', () => {
  let metadataAccessor: BullMetadataAccessor;
  beforeAll(() => {
    metadataAccessor = new BullMetadataAccessor(new Reflector());
  });

  describe('isQueueComponent', () => {
    it('should return true if the given class is a queue component', () => {
      @Processor()
      class MyQueue {}
      expect(metadataAccessor.isQueueComponent(MyQueue)).toBe(true);
    });
    it('should return false if the given class is not queue component', () => {
      class TestClass {}
      expect(metadataAccessor.isQueueComponent(TestClass)).toBe(false);
    });
  });

  describe('getQueueComponentMetadata', () => {
    it('should return the given queue component metadata', () => {
      const opts = { name: 'test' };
      @Processor(opts.name)
      class MyQueue {
        processor() {}
      }
      expect(metadataAccessor.getQueueComponentMetadata(MyQueue)).toStrictEqual(
        opts,
      );
    });
  });

  describe('isProcessor', () => {
    it('should return true if the given class property is a queue processor', () => {
      class MyQueue {
        @Process()
        processor() {}
      }
      const myQueueInstance = new MyQueue();
      expect(metadataAccessor.isProcessor(myQueueInstance.processor)).toBe(
        true,
      );
    });
    it('should return false if the given class property is not a queue processor', () => {
      class MyQueue {
        processor() {}
      }
      const myQueueInstance = new MyQueue();
      expect(metadataAccessor.isProcessor(myQueueInstance.processor)).toBe(
        false,
      );
    });
  });

  describe('getProcessMetadata', () => {
    it('should return the given queue processor metadata', () => {
      const opts = { concurrency: 42, name: 'test' };
      class MyQueue {
        @Process(opts)
        processor() {}
      }
      const myQueueInstance = new MyQueue();
      expect(
        metadataAccessor.getProcessMetadata(myQueueInstance.processor),
      ).toBe(opts);
    });
  });

  describe('isListener', () => {
    it('should return true if the given class property is a queue listener', () => {
      class MyQueue {
        @OnQueueEvent(BullQueueEvents.COMPLETED)
        listener() {}
      }
      const myQueueInstance = new MyQueue();
      expect(metadataAccessor.isListener(myQueueInstance.listener)).toBe(true);
    });
    it('should return false if the given class property is not a queue listener', () => {
      class MyQueue {
        listener() {}
      }
      const myQueueInstance = new MyQueue();
      expect(metadataAccessor.isListener(myQueueInstance.listener)).toBe(false);
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
        metadataAccessor.getListenerMetadata(myQueueInstance.listener),
      ).toHaveProperty('eventName');
      expect(
        metadataAccessor.getListenerMetadata(myQueueInstance.listener)
          .eventName,
      ).toBe(opts.eventName);
    });
    it('should return the given queue listener metadata with specified job name', () => {
      const opts = { eventName: BullQueueEvents.COMPLETED, name: 'test' };
      class MyQueue {
        @OnQueueEvent(opts)
        listener() {}
      }
      const myQueueInstance = new MyQueue();
      const metadata = metadataAccessor.getListenerMetadata(
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
      const metadata = metadataAccessor.getListenerMetadata(
        myQueueInstance.listener,
      );
      expect(metadata).toHaveProperty('eventName');
      expect(metadata).toHaveProperty('id');
      expect(metadata.eventName).toBe(opts.eventName);
      expect(metadata.id).toBe(opts.id);
    });
  });
});
