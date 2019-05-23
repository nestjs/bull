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
      @Queue()
      class MyQueue {}
      expect(Reflect.hasMetadata(BULL_MODULE_QUEUE, MyQueue)).toEqual(true);
    });
    it('should define the BULL_MODULE_QUEUE metadata with the given options', () => {
      const opts = { name: 'test' };
      @Queue(opts)
      class MyQueue {}
      expect(Reflect.getMetadata(BULL_MODULE_QUEUE, MyQueue)).toEqual(opts);
    });
  });

  describe('@QueueProcess()', () => {
    it('should decorate the method with BULL_MODULE_QUEUE_PROCESS', () => {
      class MyQueue {
        @QueueProcess()
        prop() {}
      }
      const myQueueInstance = new MyQueue();
      expect(
        Reflect.hasMetadata(BULL_MODULE_QUEUE_PROCESS, myQueueInstance.prop),
      ).toEqual(true);
    });
    it('should define the BULL_MODULE_QUEUE_PROCESS metadata with the given options', () => {
      const opts = { name: 'test', concurrency: 42 };
      class MyQueue {
        @QueueProcess(opts)
        prop() {}
      }
      const myQueueInstance = new MyQueue();
      expect(
        Reflect.getMetadata(BULL_MODULE_QUEUE_PROCESS, myQueueInstance.prop),
      ).toEqual(opts);
    });
  });

  describe('@OnQueueEvent()', () => {
    const eventName = BullQueueEvents.COMPLETED;
    class MyQueue {
      @OnQueueEvent(eventName)
      prop() {}
    }
    const myQueueInstance = new MyQueue();
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual(true);
    });
    it('should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the given event name', () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual({ eventName });
    });
  });

  describe('@OnQueueError()', () => {
    class MyQueue {
      @OnQueueError()
      prop() {}
    }
    const myQueueInstance = new MyQueue();
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual({ eventName: BullQueueEvents.ERROR });
    });
  });

  describe('@OnQueueWaiting()', () => {
    class MyQueue {
      @OnQueueWaiting()
      prop() {}
    }
    const myQueueInstance = new MyQueue();
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual({ eventName: BullQueueEvents.WAITING });
    });
  });

  describe('@OnQueueActive()', () => {
    class MyQueue {
      @OnQueueActive()
      prop() {}
    }
    const myQueueInstance = new MyQueue();
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual({ eventName: BullQueueEvents.ACTIVE });
    });
  });

  describe('@OnQueueStalled()', () => {
    class MyQueue {
      @OnQueueStalled()
      prop() {}
    }
    const myQueueInstance = new MyQueue();
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual({ eventName: BullQueueEvents.STALLED });
    });
  });

  describe('@OnQueueProgress()', () => {
    class MyQueue {
      @OnQueueProgress()
      prop() {}
    }
    const myQueueInstance = new MyQueue();
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual({ eventName: BullQueueEvents.PROGRESS });
    });
  });

  describe('@OnQueueCompleted()', () => {
    class MyQueue {
      @OnQueueCompleted()
      prop() {}
    }
    const myQueueInstance = new MyQueue();
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual({ eventName: BullQueueEvents.COMPLETED });
    });
  });

  describe('@OnQueueFailed()', () => {
    class MyQueue {
      @OnQueueFailed()
      prop() {}
    }
    const myQueueInstance = new MyQueue();
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual({ eventName: BullQueueEvents.FAILED });
    });
  });

  describe('@OnQueuePaused()', () => {
    class MyQueue {
      @OnQueuePaused()
      prop() {}
    }
    const myQueueInstance = new MyQueue();
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual({ eventName: BullQueueEvents.PAUSED });
    });
  });

  describe('@OnQueueResumed()', () => {
    class MyQueue {
      @OnQueueResumed()
      prop() {}
    }
    const myQueueInstance = new MyQueue();
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual({ eventName: BullQueueEvents.RESUMED });
    });
  });

  describe('@OnQueueCleaned()', () => {
    class MyQueue {
      @OnQueueCleaned()
      prop() {}
    }
    const myQueueInstance = new MyQueue();
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual({ eventName: BullQueueEvents.CLEANED });
    });
  });

  describe('@OnQueueDrained()', () => {
    class MyQueue {
      @OnQueueDrained()
      prop() {}
    }
    const myQueueInstance = new MyQueue();
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual({ eventName: BullQueueEvents.DRAINED });
    });
  });

  describe('@OnQueueRemoved()', () => {
    class MyQueue {
      @OnQueueRemoved()
      prop() {}
    }
    const myQueueInstance = new MyQueue();
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual({ eventName: BullQueueEvents.REMOVED });
    });
  });

  describe('@OnGlobalQueueError()', () => {
    class MyQueue {
      @OnGlobalQueueError()
      prop() {}
    }
    const myQueueInstance = new MyQueue();
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual({ eventName: BullQueueGlobalEvents.ERROR });
    });
  });

  describe('@OnGlobalQueueWaiting()', () => {
    class MyQueue {
      @OnGlobalQueueWaiting()
      prop() {}
    }
    const myQueueInstance = new MyQueue();
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual({ eventName: BullQueueGlobalEvents.WAITING });
    });
  });

  describe('@OnGlobalQueueActive()', () => {
    class MyQueue {
      @OnGlobalQueueActive()
      prop() {}
    }
    const myQueueInstance = new MyQueue();
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual({ eventName: BullQueueGlobalEvents.ACTIVE });
    });
  });

  describe('@OnGlobalQueueStalled()', () => {
    class MyQueue {
      @OnGlobalQueueStalled()
      prop() {}
    }
    const myQueueInstance = new MyQueue();
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual({ eventName: BullQueueGlobalEvents.STALLED });
    });
  });

  describe('@OnGlobalQueueProgress()', () => {
    class MyQueue {
      @OnGlobalQueueProgress()
      prop() {}
    }
    const myQueueInstance = new MyQueue();
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual({ eventName: BullQueueGlobalEvents.PROGRESS });
    });
  });

  describe('@OnGlobalQueueCompleted()', () => {
    class MyQueue {
      @OnGlobalQueueCompleted()
      prop() {}
    }
    const myQueueInstance = new MyQueue();
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual({ eventName: BullQueueGlobalEvents.COMPLETED });
    });
  });

  describe('@OnGlobalQueueFailed()', () => {
    class MyQueue {
      @OnGlobalQueueFailed()
      prop() {}
    }
    const myQueueInstance = new MyQueue();
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual({ eventName: BullQueueGlobalEvents.FAILED });
    });
  });

  describe('@OnGlobalQueuePaused()', () => {
    class MyQueue {
      @OnGlobalQueuePaused()
      prop() {}
    }
    const myQueueInstance = new MyQueue();
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual({ eventName: BullQueueGlobalEvents.PAUSED });
    });
  });

  describe('@OnGlobalQueueResumed()', () => {
    class MyQueue {
      @OnGlobalQueueResumed()
      prop() {}
    }
    const myQueueInstance = new MyQueue();
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual({ eventName: BullQueueGlobalEvents.RESUMED });
    });
  });

  describe('@OnGlobalQueueCleaned()', () => {
    class MyQueue {
      @OnGlobalQueueCleaned()
      prop() {}
    }
    const myQueueInstance = new MyQueue();
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual({ eventName: BullQueueGlobalEvents.CLEANED });
    });
  });

  describe('@OnGlobalQueueDrained()', () => {
    class MyQueue {
      @OnGlobalQueueDrained()
      prop() {}
    }
    const myQueueInstance = new MyQueue();
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual({ eventName: BullQueueGlobalEvents.DRAINED });
    });
  });

  describe('@OnGlobalQueueRemoved()', () => {
    class MyQueue {
      @OnGlobalQueueRemoved()
      prop() {}
    }
    const myQueueInstance = new MyQueue();
    it('should decorate the method with BULL_MODULE_ON_QUEUE_EVENT', () => {
      expect(
        Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual(true);
    });
    it(`should define the BULL_MODULE_ON_QUEUE_EVENT metadata with the 'error' event name`, () => {
      expect(
        Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, myQueueInstance.prop),
      ).toEqual({ eventName: BullQueueGlobalEvents.REMOVED });
    });
  });
});
