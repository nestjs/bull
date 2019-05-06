import {
  OnQueueEvent,
  QueueProcess,
  Queue,
  OnQueueError,
  OnQueueWaiting,
  OnQueueActive,
  OnQueueStalled,
  OnQueueProgress,
  OnQueueCompleted,
  OnQueueFailed,
  OnQueuePaused,
  OnQueueResumed,
  OnQueueCleaned,
  OnQueueDrained,
  OnQueueRemoved,
  OnGlobalQueueRemoved,
  OnGlobalQueueDrained,
  OnGlobalQueueCleaned,
  OnGlobalQueueResumed,
  OnGlobalQueuePaused,
  OnGlobalQueueFailed,
  OnGlobalQueueCompleted,
  OnGlobalQueueProgress,
  OnGlobalQueueStalled,
  OnGlobalQueueActive,
  OnGlobalQueueWaiting,
  OnGlobalQueueError,
} from './bull.decorators';
import { BullQueueEvents, BullQueueGlobalEvents } from './bull.enums';
import {
  BULL_MODULE_ON_QUEUE_EVENT,
  BULL_MODULE_QUEUE_PROCESS,
  BULL_MODULE_QUEUE,
} from './bull.constants';

describe('Decorators', () => {
  describe('@InjectQueue()', () => {
    it.todo('should enhance class with expected constructor params metadata');
  });

  describe('@Queue()', () => {
    it('should decorate the class with BULL_MODULE_QUEUE', () => {
      const decorate = Queue();
      const target = Function;
      decorate(target);
      expect(Reflect.hasMetadata(BULL_MODULE_QUEUE, target)).toEqual(true);
    });
    it.todo(
      'should define the BULL_MODULE_QUEUE metadata with the given options',
    );
  });

  describe('@QueueProcess()', () => {
    it('should decorate the method with BULL_MODULE_QUEUE_PROCESS', () => {
      const target = { prop: () => 'foo' };
      QueueProcess()(
        target,
        'prop',
        Object.getOwnPropertyDescriptor(target, 'prop'),
      );
      expect(
        Reflect.hasMetadata(BULL_MODULE_QUEUE_PROCESS, target, 'prop'),
      ).toEqual(true);
    });
    it('should define the BULL_MODULE_QUEUE_PROCESS metadata with the given options', () => {
      const target = { prop: () => 'foo' };
      const opts = { name: 'test', concurrency: 42 };
      QueueProcess(opts)(
        target,
        'prop',
        Object.getOwnPropertyDescriptor(target, 'prop'),
      );
      expect(
        Reflect.getMetadata(BULL_MODULE_QUEUE_PROCESS, target, 'prop'),
      ).toEqual(opts);
    });
  });

  describe('@OnQueueEvent()', () => {
    const eventName = BullQueueEvents.COMPLETED;
    const target = { prop: () => 'foo' };
    OnQueueEvent(eventName)(
      target,
      'prop',
      Object.getOwnPropertyDescriptor(target, 'prop'),
    );
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual(true);
    });
    it('should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the given event name', () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual({ eventName });
    });
  });

  describe('@OnQueueError()', () => {
    const target = { prop: () => 'foo' };
    OnQueueError()(
      target,
      'prop',
      Object.getOwnPropertyDescriptor(target, 'prop'),
    );
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual({ eventName: BullQueueEvents.ERROR });
    });
  });

  describe('@OnQueueWaiting()', () => {
    const target = { prop: () => 'foo' };
    OnQueueWaiting()(
      target,
      'prop',
      Object.getOwnPropertyDescriptor(target, 'prop'),
    );
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual({ eventName: BullQueueEvents.WAITING });
    });
  });

  describe('@OnQueueActive()', () => {
    const target = { prop: () => 'foo' };
    OnQueueActive()(
      target,
      'prop',
      Object.getOwnPropertyDescriptor(target, 'prop'),
    );
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual({ eventName: BullQueueEvents.ACTIVE });
    });
  });

  describe('@OnQueueStalled()', () => {
    const target = { prop: () => 'foo' };
    OnQueueStalled()(
      target,
      'prop',
      Object.getOwnPropertyDescriptor(target, 'prop'),
    );
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual({ eventName: BullQueueEvents.STALLED });
    });
  });

  describe('@OnQueueProgress()', () => {
    const target = { prop: () => 'foo' };
    OnQueueProgress()(
      target,
      'prop',
      Object.getOwnPropertyDescriptor(target, 'prop'),
    );
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual({ eventName: BullQueueEvents.PROGRESS });
    });
  });

  describe('@OnQueueCompleted()', () => {
    const target = { prop: () => 'foo' };
    OnQueueCompleted()(
      target,
      'prop',
      Object.getOwnPropertyDescriptor(target, 'prop'),
    );
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual({ eventName: BullQueueEvents.COMPLETED });
    });
  });

  describe('@OnQueueFailed()', () => {
    const target = { prop: () => 'foo' };
    OnQueueFailed()(
      target,
      'prop',
      Object.getOwnPropertyDescriptor(target, 'prop'),
    );
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual({ eventName: BullQueueEvents.FAILED });
    });
  });

  describe('@OnQueuePaused()', () => {
    const target = { prop: () => 'foo' };
    OnQueuePaused()(
      target,
      'prop',
      Object.getOwnPropertyDescriptor(target, 'prop'),
    );
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual({ eventName: BullQueueEvents.PAUSED });
    });
  });

  describe('@OnQueueResumed()', () => {
    const target = { prop: () => 'foo' };
    OnQueueResumed()(
      target,
      'prop',
      Object.getOwnPropertyDescriptor(target, 'prop'),
    );
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual({ eventName: BullQueueEvents.RESUMED });
    });
  });

  describe('@OnQueueCleaned()', () => {
    const target = { prop: () => 'foo' };
    OnQueueCleaned()(
      target,
      'prop',
      Object.getOwnPropertyDescriptor(target, 'prop'),
    );
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual({ eventName: BullQueueEvents.CLEANED });
    });
  });

  describe('@OnQueueDrained()', () => {
    const target = { prop: () => 'foo' };
    OnQueueDrained()(
      target,
      'prop',
      Object.getOwnPropertyDescriptor(target, 'prop'),
    );
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual({ eventName: BullQueueEvents.DRAINED });
    });
  });

  describe('@OnQueueRemoved()', () => {
    const target = { prop: () => 'foo' };
    OnQueueRemoved()(
      target,
      'prop',
      Object.getOwnPropertyDescriptor(target, 'prop'),
    );
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual({ eventName: BullQueueEvents.REMOVED });
    });
  });

  describe('@OnGlobalQueueError()', () => {
    const target = { prop: () => 'foo' };
    OnGlobalQueueError()(
      target,
      'prop',
      Object.getOwnPropertyDescriptor(target, 'prop'),
    );
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual({ eventName: BullQueueGlobalEvents.ERROR });
    });
  });

  describe('@OnGlobalQueueWaiting()', () => {
    const target = { prop: () => 'foo' };
    OnGlobalQueueWaiting()(
      target,
      'prop',
      Object.getOwnPropertyDescriptor(target, 'prop'),
    );
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual({ eventName: BullQueueGlobalEvents.WAITING });
    });
  });

  describe('@OnGlobalQueueActive()', () => {
    const target = { prop: () => 'foo' };
    OnGlobalQueueActive()(
      target,
      'prop',
      Object.getOwnPropertyDescriptor(target, 'prop'),
    );
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual({ eventName: BullQueueGlobalEvents.ACTIVE });
    });
  });

  describe('@OnGlobalQueueStalled()', () => {
    const target = { prop: () => 'foo' };
    OnGlobalQueueStalled()(
      target,
      'prop',
      Object.getOwnPropertyDescriptor(target, 'prop'),
    );
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual({ eventName: BullQueueGlobalEvents.STALLED });
    });
  });

  describe('@OnGlobalQueueProgress()', () => {
    const target = { prop: () => 'foo' };
    OnGlobalQueueProgress()(
      target,
      'prop',
      Object.getOwnPropertyDescriptor(target, 'prop'),
    );
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual({ eventName: BullQueueGlobalEvents.PROGRESS });
    });
  });

  describe('@OnGlobalQueueCompleted()', () => {
    const target = { prop: () => 'foo' };
    OnGlobalQueueCompleted()(
      target,
      'prop',
      Object.getOwnPropertyDescriptor(target, 'prop'),
    );
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual({ eventName: BullQueueGlobalEvents.COMPLETED });
    });
  });

  describe('@OnGlobalQueueFailed()', () => {
    const target = { prop: () => 'foo' };
    OnGlobalQueueFailed()(
      target,
      'prop',
      Object.getOwnPropertyDescriptor(target, 'prop'),
    );
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual({ eventName: BullQueueGlobalEvents.FAILED });
    });
  });

  describe('@OnGlobalQueuePaused()', () => {
    const target = { prop: () => 'foo' };
    OnGlobalQueuePaused()(
      target,
      'prop',
      Object.getOwnPropertyDescriptor(target, 'prop'),
    );
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual({ eventName: BullQueueGlobalEvents.PAUSED });
    });
  });

  describe('@OnGlobalQueueResumed()', () => {
    const target = { prop: () => 'foo' };
    OnGlobalQueueResumed()(
      target,
      'prop',
      Object.getOwnPropertyDescriptor(target, 'prop'),
    );
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual({ eventName: BullQueueGlobalEvents.RESUMED });
    });
  });

  describe('@OnGlobalQueueCleaned()', () => {
    const target = { prop: () => 'foo' };
    OnGlobalQueueCleaned()(
      target,
      'prop',
      Object.getOwnPropertyDescriptor(target, 'prop'),
    );
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual({ eventName: BullQueueGlobalEvents.CLEANED });
    });
  });

  describe('@OnGlobalQueueDrained()', () => {
    const target = { prop: () => 'foo' };
    OnGlobalQueueDrained()(
      target,
      'prop',
      Object.getOwnPropertyDescriptor(target, 'prop'),
    );
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual({ eventName: BullQueueGlobalEvents.DRAINED });
    });
  });

  describe('@OnGlobalQueueRemoved()', () => {
    const target = { prop: () => 'foo' };
    OnGlobalQueueRemoved()(
      target,
      'prop',
      Object.getOwnPropertyDescriptor(target, 'prop'),
    );
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, target, 'prop'),
      ).toEqual({ eventName: BullQueueGlobalEvents.REMOVED });
    });
  });
});
