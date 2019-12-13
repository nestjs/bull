import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bull';
import { BullModule, getQueueToken } from '../lib';

describe('BullModule', () => {
  let module: TestingModule;
  describe('register', () => {
    describe('single configuration', () => {
      const fakeProcessor = jest.fn();
      beforeAll(async () => {
        module = await Test.createTestingModule({
          imports: [
            BullModule.register({
              name: 'test',
              options: {
                redis: {
                  port: 6380,
                },
              },
              processors: [fakeProcessor],
            }),
          ],
        }).compile();
      });
      it('should inject the queue with the given name', () => {
        const queue: Queue = module.get<Queue>(getQueueToken('test'));
        expect(queue).toBeDefined();
      });
    });
    describe('multiple configuration', () => {
      beforeAll(async () => {
        module = await Test.createTestingModule({
          imports: [
            BullModule.register([
              {
                name: 'test1',
                options: {
                  redis: {
                    port: 6380,
                  },
                },
              },
              {
                name: 'test2',
                options: {
                  redis: {
                    port: 6380,
                  },
                },
              },
            ]),
          ],
        }).compile();
      });
      it('should inject the queue with name "test1"', () => {
        const queue: Queue = module.get<Queue>(getQueueToken('test1'));
        expect(queue).toBeDefined();
      });
      it('should inject the queue with name "test2"', () => {
        const queue: Queue = module.get<Queue>(getQueueToken('test2'));
        expect(queue).toBeDefined();
      });
    });
  });
  describe('registerAsync', () => {
    describe('single configuration', () => {
      describe('useFactory', () => {
        const fakeProcessor = jest.fn();
        beforeAll(async () => {
          module = await Test.createTestingModule({
            imports: [
              BullModule.registerAsync({
                name: 'test',
                useFactory: () => ({
                  processors: [fakeProcessor],
                  options: {
                    redis: {
                      port: 6380,
                    },
                  },
                }),
              }),
            ],
          }).compile();
        });
        it('should inject the queue with the given name', () => {
          const queue: Queue = module.get<Queue>(getQueueToken('test'));
          expect(queue).toBeDefined();
        });
        it('the injected queue should have the given processor', () => {
          const queue: Queue = module.get<Queue>(getQueueToken('test'));
        });
      });
    });
    describe('multiple configuration', () => {
      describe('useFactory', () => {
        beforeAll(async () => {
          module = await Test.createTestingModule({
            imports: [
              BullModule.registerAsync([
                {
                  name: 'test1',
                  useFactory: () => ({
                    options: {
                      redis: {
                        port: 6380,
                      },
                    },
                  }),
                },
                {
                  name: 'test2',
                  useFactory: () => ({
                    options: {
                      redis: {
                        port: 6380,
                      },
                    },
                  }),
                },
              ]),
            ],
          }).compile();
        });
        it('should inject the queue with name "test1"', () => {
          const queue: Queue = module.get<Queue>(getQueueToken('test1'));
          expect(queue).toBeDefined();
        });
        it('should inject the queue with name "test2"', () => {
          const queue: Queue = module.get<Queue>(getQueueToken('test2'));
          expect(queue).toBeDefined();
        });
      });
    });
  });
});
