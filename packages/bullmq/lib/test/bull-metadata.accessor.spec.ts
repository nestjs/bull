import { Reflector } from '@nestjs/core';
import {
  OnQueueEvent,
  OnWorkerEvent,
  Processor,
  QueueEventsListener,
} from '..';
import { BullMetadataAccessor } from '../bull-metadata.accessor';

describe('BullMetadataAccessor', () => {
  let metadataAccessor: BullMetadataAccessor;
  beforeAll(() => {
    metadataAccessor = new BullMetadataAccessor(new Reflector());
  });

  describe('isProcessor', () => {
    it('should return true if the given class is registered processor', () => {
      @Processor('queue')
      class MyQueue {}
      expect(metadataAccessor.isProcessor(MyQueue)).toBe(true);
    });
    it('should return false if the given class is not registered as a processor', () => {
      class TestClass {}
      expect(metadataAccessor.isProcessor(TestClass)).toBe(false);
    });
  });

  describe('getProcessorMetadata', () => {
    it('should return processor metadata', () => {
      const opts = { name: 'test' };
      @Processor(opts.name)
      class MyQueue {
        process() {}
      }
      expect(metadataAccessor.getProcessorMetadata(MyQueue)).toStrictEqual(
        opts,
      );
    });
  });

  describe('getWorkerOptionsMetadata', () => {
    it('should return specified worker metadata', () => {
      const workerOpts = { concurrency: 42 };

      @Processor('test', workerOpts)
      class MyQueue {}

      expect(metadataAccessor.getWorkerOptionsMetadata(MyQueue)).toBe(
        workerOpts,
      );
    });
  });

  describe('isQueueEventsListener', () => {
    it('should return true if the given class is a queue events listener', () => {
      @QueueEventsListener('queue_name')
      class EventsListener {}

      expect(metadataAccessor.isQueueEventsListener(EventsListener)).toBe(true);
    });
    it('should return false if the given class is not a queue events listener', () => {
      class EventsListener {}
      expect(metadataAccessor.isQueueEventsListener(EventsListener)).toBe(
        false,
      );
    });
  });

  describe('getQueueEventsListenerMetadata', () => {
    it('should return queue events listener metadata', () => {
      const opts = {
        sharedConnection: true,
      };
      @QueueEventsListener('test', opts)
      class EventsListener {}

      expect(
        metadataAccessor.getQueueEventsListenerMetadata(EventsListener),
      ).toEqual({
        queueName: 'test',
        queueEventsOptions: opts,
      });
    });
  });

  describe('getOnQueueEventMetadata', () => {
    it('should return queue event handler metadata', () => {
      class EventsListener {
        @OnQueueEvent('completed')
        onCompleted() {}
      }

      const instance = new EventsListener();
      expect(
        metadataAccessor.getOnQueueEventMetadata(instance.onCompleted),
      ).toEqual({
        eventName: 'completed',
      });
    });
  });

  describe('getOnWorkerEventMetadata', () => {
    it('should return worker event handler metadata', () => {
      class Worker {
        @OnWorkerEvent('completed')
        onCompleted() {}
      }

      const instance = new Worker();
      expect(
        metadataAccessor.getOnWorkerEventMetadata(instance.onCompleted),
      ).toEqual({
        eventName: 'completed',
      });
    });
  });
});
