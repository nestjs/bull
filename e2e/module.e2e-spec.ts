import { MetadataScanner } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bull';
import { BullModule, getQueueToken, Processor } from '../lib';

describe('BullModule', () => {
  describe('registerQueue', () => {
    let moduleRef: TestingModule;

    describe('single configuration', () => {
      beforeAll(async () => {
        moduleRef = await Test.createTestingModule({
          imports: [
            BullModule.registerQueue({
              name: 'test',
              redis: {
                host: '0.0.0.0',
                port: 6380,
              },
            }),
          ],
        }).compile();
      });
      afterAll(async () => {
        await moduleRef.close();
      });
      it('should inject the queue with the given name', () => {
        const queue = moduleRef.get<Queue>(getQueueToken('test'));

        expect(queue).toBeDefined();
        expect(queue.name).toEqual('test');
      });
    });

    describe('multiple configurations', () => {
      beforeAll(async () => {
        moduleRef = await Test.createTestingModule({
          imports: [
            BullModule.registerQueue(
              {
                name: 'test1',
                redis: {
                  host: '0.0.0.0',
                  port: 6380,
                },
              },
              {
                name: 'test2',
                redis: {
                  host: '0.0.0.0',
                  port: 6380,
                },
              },
            ),
          ],
        }).compile();
      });
      afterAll(async () => {
        await moduleRef.close();
      });
      it('should inject the queue with name "test1"', () => {
        const queue: Queue = moduleRef.get<Queue>(getQueueToken('test1'));
        expect(queue).toBeDefined();
        expect(queue.name).toEqual('test1');
      });
      it('should inject the queue with name "test2"', () => {
        const queue: Queue = moduleRef.get<Queue>(getQueueToken('test2'));
        expect(queue).toBeDefined();
        expect(queue.name).toEqual('test2');
      });
    });
  });

  describe('forRoot + registerQueue', () => {
    let moduleRef: TestingModule;

    describe('single configuration', () => {
      beforeAll(async () => {
        moduleRef = await Test.createTestingModule({
          imports: [
            BullModule.forRoot({
              redis: {
                host: '0.0.0.0',
                port: 6380,
              },
            }),
            BullModule.registerQueue({
              name: 'test',
            }),
          ],
        }).compile();
      });
      afterAll(async () => {
        await moduleRef.close();
      });

      it('should inject the queue with the given name', () => {
        const queue: Queue = moduleRef.get<Queue>(getQueueToken('test'));
        expect(queue).toBeDefined();
        expect(queue.name).toEqual('test');
      });
    });

    describe('multiple configurations', () => {
      beforeAll(async () => {
        moduleRef = await Test.createTestingModule({
          imports: [
            BullModule.forRoot({
              redis: {
                host: '0.0.0.0',
                port: 6380,
              },
            }),
            BullModule.registerQueue({ name: 'test1' }, { name: 'test2' }),
          ],
        }).compile();
      });
      afterAll(async () => {
        await moduleRef.close();
      });
      it('should inject the queue with name "test1"', () => {
        const queue = moduleRef.get<Queue>(getQueueToken('test1'));

        expect(queue).toBeDefined();
        expect(queue.name).toEqual('test1');
      });
      it('should inject the queue with name "test2"', () => {
        const queue = moduleRef.get<Queue>(getQueueToken('test2'));

        expect(queue).toBeDefined();
        expect(queue.name).toEqual('test2');
      });
    });
  });

  describe('registerQueueAsync', () => {
    let moduleRef: TestingModule;

    describe('single configuration', () => {
      describe('useFactory', () => {
        beforeAll(async () => {
          moduleRef = await Test.createTestingModule({
            imports: [
              BullModule.registerQueueAsync({
                name: 'test',
                useFactory: () => ({
                  redis: {
                    host: '0.0.0.0',
                    port: 6380,
                  },
                }),
              }),
            ],
          }).compile();
        });
        afterAll(async () => {
          await moduleRef.close();
        });
        it('should inject the queue with the given name', () => {
          const queue: Queue = moduleRef.get<Queue>(getQueueToken('test'));
          expect(queue).toBeDefined();
          expect(queue.name).toEqual('test');
        });
      });
    });
    describe('multiple configurations', () => {
      describe('useFactory', () => {
        beforeAll(async () => {
          moduleRef = await Test.createTestingModule({
            imports: [
              BullModule.registerQueueAsync(
                {
                  name: 'test1',
                  useFactory: () => ({
                    redis: {
                      host: '0.0.0.0',
                      port: 6380,
                    },
                  }),
                },
                {
                  name: 'test2',
                  useFactory: () => ({
                    redis: {
                      host: '0.0.0.0',
                      port: 6380,
                    },
                  }),
                },
              ),
            ],
          }).compile();
        });
        afterAll(async () => {
          await moduleRef.close();
        });
        it('should inject the queue with name "test1"', () => {
          const queue: Queue = moduleRef.get<Queue>(getQueueToken('test1'));
          expect(queue).toBeDefined();
          expect(queue.name).toEqual('test1');
        });
        it('should inject the queue with name "test2"', () => {
          const queue: Queue = moduleRef.get<Queue>(getQueueToken('test2'));
          expect(queue).toBeDefined();
          expect(queue.name).toEqual('test2');
        });
      });
    });
  });

  describe('forRootAsync + registerQueueAsync', () => {
    let moduleRef: TestingModule;

    describe('single configuration', () => {
      describe('useFactory', () => {
        let processorWasCalled = false;

        beforeAll(async () => {
          moduleRef = await Test.createTestingModule({
            imports: [
              BullModule.forRootAsync({
                useFactory: () => ({
                  redis: 'redis://0.0.0.0:6380',
                }),
              }),
              BullModule.registerQueueAsync({
                name: 'test',
                useFactory: () => ({
                  processors: [
                    (_, done) => {
                      processorWasCalled = true;
                      done();
                    },
                  ],
                }),
              }),
            ],
          }).compile();
        });
        afterAll(async () => {
          await moduleRef.close();
        });
        it('should inject the queue with the given name', () => {
          const queue = moduleRef.get<Queue>(getQueueToken('test'));

          expect(queue).toBeDefined();
          expect(queue.name).toEqual('test');
        });
        it('should trigger the processor function', async () => {
          const queue = moduleRef.get<Queue>(getQueueToken('test'));
          const job = await queue.add({ test: true });
          await job.finished();

          expect(processorWasCalled).toBeTruthy();
        });
      });
    });

    describe('multiple configurations', () => {
      describe('useFactory', () => {
        beforeAll(async () => {
          moduleRef = await Test.createTestingModule({
            imports: [
              BullModule.forRootAsync({
                useFactory: () => ({
                  redis: {
                    host: '0.0.0.0',
                    port: 6380,
                  },
                }),
              }),
              BullModule.registerQueueAsync({ name: 'test1' }),
              BullModule.registerQueue({ name: 'test2' }),
            ],
          }).compile();
        });
        afterAll(async () => {
          await moduleRef.close();
        });
        it('should inject the queue with name "test1"', () => {
          const queue = moduleRef.get<Queue>(getQueueToken('test1'));

          expect(queue).toBeDefined();
          expect(queue.name).toEqual('test1');
        });
        it('should inject the queue with name "test2"', () => {
          const queue = moduleRef.get<Queue>(getQueueToken('test2'));

          expect(queue).toBeDefined();
          expect(queue.name).toEqual('test2');
        });
      });
    });
  });

  describe('forRootAsync + registerQueueAsync', () => {
    let moduleRef: TestingModule;

    describe('single configuration', () => {
      describe('useFactory', () => {
        beforeAll(async () => {
          moduleRef = await Test.createTestingModule({
            imports: [
              BullModule.forRootAsync({
                useFactory: () => ({
                  redis: {
                    host: '0.0.0.0',
                    port: 6380,
                  },
                }),
              }),
              BullModule.registerQueueAsync({
                name: 'test',
                useFactory: () => ({
                  processors: [],
                }),
              }),
            ],
          }).compile();
        });
        afterAll(async () => {
          await moduleRef.close();
        });
        it('should inject the queue with the given name', () => {
          const queue = moduleRef.get<Queue>(getQueueToken('test'));

          expect(queue).toBeDefined();
          expect(queue.name).toEqual('test');
        });
      });
    });

    describe('multiple shared configurations', () => {
      describe('useFactory', () => {
        beforeAll(async () => {
          moduleRef = await Test.createTestingModule({
            imports: [
              BullModule.forRootAsync({
                useFactory: () => ({
                  redis: {
                    host: '0.0.0.0',
                    port: 6380,
                  },
                }),
              }),
              BullModule.registerQueueAsync({ name: 'test1' }),
              BullModule.registerQueue({
                name: 'test2',
              }),
            ],
          }).compile();
        });
        afterAll(async () => {
          await moduleRef.close();
        });
        it('should inject the queue with name "test1"', () => {
          const queue = moduleRef.get<Queue>(getQueueToken('test1'));

          expect(queue).toBeDefined();
          expect(queue.name).toEqual('test1');
        });
        it('should inject the queue with name "test2"', () => {
          const queue = moduleRef.get<Queue>(getQueueToken('test2'));

          expect(queue).toBeDefined();
          expect(queue.name).toEqual('test2');
        });
      });
    });
  });

  describe('full flow (job handling)', () => {
    const queueName = 'full_flow_queue';

    it('should process jobs with the given processors', (done) => {
      const processor = (_, complete: () => void) => {
        complete();
        done();
      };

      Test.createTestingModule({
        imports: [
          BullModule.registerQueue({
            name: queueName,
            redis: {
              host: '0.0.0.0',
              port: 6380,
            },
            processors: [processor],
          }),
        ],
      })
        .compile()
        .then(async (testingModule) => {
          const queue = testingModule.get<Queue>(getQueueToken(queueName));
          const job = await queue.add({ test: true });
          await job.finished();
          await testingModule.close();
        });
    });
  });

  describe('handles all kind of valid processors providers', () => {
    @Processor('test_processor_registering')
    class MyProcessorA {}

    @Processor('test_processor_registering')
    class MyProcessorB {}

    @Processor('test_processor_registering')
    class MyProcessorC {}

    let testingModule: TestingModule;

    let metadataScanner: MetadataScanner;

    beforeAll(async () => {
      testingModule = await Test.createTestingModule({
        imports: [
          BullModule.registerQueue({
            name: 'test_processor_registering',
            redis: {
              host: '0.0.0.0',
              port: 6380,
            },
          }),
        ],
        providers: [
          {
            provide: 'A',
            useClass: MyProcessorA,
          },
          {
            provide: 'B',
            useValue: new MyProcessorB(),
          },
          {
            provide: 'C',
            useFactory: () => new MyProcessorC(),
          },
        ],
      }).compile();

      metadataScanner = testingModule.get(MetadataScanner);
      jest.spyOn(metadataScanner, 'scanFromPrototype');

      await testingModule.init();
    });
    afterAll(async () => {
      await testingModule.close();
    });

    it('should use MetadataScanner#scanFromPrototype when exploring', () => {
      expect(metadataScanner.scanFromPrototype).toHaveBeenCalled();
    });

    it('should reach the processor supplied with `useClass`', () => {
      const scanPrototypeCalls = jest.spyOn(
        metadataScanner,
        'scanFromPrototype',
      ).mock.calls;

      const scanPrototypeCallsFirstArgsEveryCall = scanPrototypeCalls.flatMap(
        (args) => args[0],
      );

      expect(
        scanPrototypeCallsFirstArgsEveryCall.some(
          (instanceWrapperInstance) =>
            instanceWrapperInstance.constructor.name === MyProcessorA.name,
        ),
      ).toBeTruthy();
    });

    it('should reach the processor supplied with `useValue`', () => {
      const scanPrototypeCalls = jest.spyOn(
        metadataScanner,
        'scanFromPrototype',
      ).mock.calls;

      const scanPrototypeCallsFirstArgsEveryCall = scanPrototypeCalls.flatMap(
        (args) => args[0],
      );

      expect(
        scanPrototypeCallsFirstArgsEveryCall.some(
          (instanceWrapperInstance) =>
            instanceWrapperInstance.constructor.name === MyProcessorB.name,
        ),
      ).toBeTruthy();
    });

    it('should reach the processor supplied with `useFactory`', () => {
      const scanPrototypeCalls = jest.spyOn(
        metadataScanner,
        'scanFromPrototype',
      ).mock.calls;

      const scanPrototypeCallsFirstArgsEveryCall = scanPrototypeCalls.flatMap(
        (args) => args[0],
      );

      expect(
        scanPrototypeCallsFirstArgsEveryCall.some(
          (instanceWrapperInstance) =>
            instanceWrapperInstance.constructor.name === MyProcessorC.name,
        ),
      ).toBeTruthy();
    });
  });
});
