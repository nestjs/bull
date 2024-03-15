import { MetadataScanner } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { FlowProducer, Job, Queue, QueueEvents } from 'bullmq';
import {
  BullModule,
  getFlowProducerToken,
  getQueueToken,
  OnQueueEvent,
  OnWorkerEvent,
  Processor,
  QueueEventsHost,
  QueueEventsListener,
  WorkerHost,
  BullRegistrator,
} from '../lib';

jest.setTimeout(10000);

describe('BullModule', () => {
  describe('registerQueue', () => {
    let moduleRef: TestingModule;

    describe('single configuration', () => {
      beforeAll(async () => {
        moduleRef = await Test.createTestingModule({
          imports: [
            BullModule.registerQueue({
              name: 'test',
              connection: {
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
                connection: {
                  host: '0.0.0.0',
                  port: 6380,
                },
              },
              {
                name: 'test2',
                connection: {
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

  describe('registerFlowProducer', () => {
    let moduleRef: TestingModule;

    describe('single configuration', () => {
      beforeAll(async () => {
        moduleRef = await Test.createTestingModule({
          imports: [
            BullModule.registerFlowProducer({
              name: 'test',
              connection: {
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
      it('should inject the flowProducer with the given name', () => {
        const flowProducer = moduleRef.get<FlowProducer>(
          getFlowProducerToken('test'),
        );

        expect(flowProducer).toBeDefined();
        expect((flowProducer.opts as any).name).toEqual('test');
      });
    });

    describe('multiple configurations', () => {
      beforeAll(async () => {
        moduleRef = await Test.createTestingModule({
          imports: [
            BullModule.registerFlowProducer(
              {
                name: 'test1',
                connection: {
                  host: '0.0.0.0',
                  port: 6380,
                },
              },
              {
                name: 'test2',
                connection: {
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
      it('should inject the flowProducer with name "test1"', () => {
        const flowProducer: FlowProducer = moduleRef.get<FlowProducer>(
          getFlowProducerToken('test1'),
        );
        expect(flowProducer).toBeDefined();
        expect((flowProducer.opts as any).name).toEqual('test1');
      });
      it('should inject the flowProducer with name "test2"', () => {
        const flowProducer: FlowProducer = moduleRef.get<FlowProducer>(
          getFlowProducerToken('test2'),
        );
        expect(flowProducer).toBeDefined();
        expect((flowProducer.opts as any).name).toEqual('test2');
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
              connection: {
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
              connection: {
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

  describe('forRoot + registerFlowProducer', () => {
    let moduleRef: TestingModule;

    describe('single configuration', () => {
      beforeAll(async () => {
        moduleRef = await Test.createTestingModule({
          imports: [
            BullModule.forRoot({
              connection: {
                host: '0.0.0.0',
                port: 6380,
              },
            }),
            BullModule.registerFlowProducer({
              name: 'test',
            }),
          ],
        }).compile();
      });
      afterAll(async () => {
        await moduleRef.close();
      });

      it('should inject the flowProducer with the given name', () => {
        const flowProducer: FlowProducer = moduleRef.get<FlowProducer>(
          getFlowProducerToken('test'),
        );
        expect(flowProducer).toBeDefined();
        expect((flowProducer.opts as any).name).toEqual('test');
      });
    });

    describe('multiple configurations', () => {
      beforeAll(async () => {
        moduleRef = await Test.createTestingModule({
          imports: [
            BullModule.forRoot({
              connection: {
                host: '0.0.0.0',
                port: 6380,
              },
            }),
            BullModule.registerFlowProducer(
              { name: 'test1' },
              { name: 'test2' },
            ),
          ],
        }).compile();
      });
      afterAll(async () => {
        await moduleRef.close();
      });
      it('should inject the flowProducer with name "test1"', () => {
        const flowProducer = moduleRef.get<FlowProducer>(
          getFlowProducerToken('test1'),
        );

        expect(flowProducer).toBeDefined();
        expect((flowProducer.opts as any).name).toEqual('test1');
      });
      it('should inject the flowProducer with name "test2"', () => {
        const flowProducer = moduleRef.get<FlowProducer>(
          getFlowProducerToken('test2'),
        );

        expect(flowProducer).toBeDefined();
        expect((flowProducer.opts as any).name).toEqual('test2');
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
                  connection: {
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
                    connection: {
                      host: '0.0.0.0',
                      port: 6380,
                    },
                  }),
                },
                {
                  name: 'test2',
                  useFactory: () => ({
                    connection: {
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

  describe('registerFlowProducerAsync', () => {
    let moduleRef: TestingModule;

    describe('single configuration', () => {
      describe('useFactory', () => {
        beforeAll(async () => {
          moduleRef = await Test.createTestingModule({
            imports: [
              BullModule.registerFlowProducerAsync({
                name: 'test',
                useFactory: () => ({
                  connection: {
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
        it('should inject the flowProducer with the given name', () => {
          const flowProducer: FlowProducer = moduleRef.get<FlowProducer>(
            getFlowProducerToken('test'),
          );
          expect(flowProducer).toBeDefined();
          expect((flowProducer.opts as any).name).toEqual('test');
        });
      });
    });
    describe('multiple configurations', () => {
      describe('useFactory', () => {
        beforeAll(async () => {
          moduleRef = await Test.createTestingModule({
            imports: [
              BullModule.registerFlowProducerAsync(
                {
                  name: 'test1',
                  useFactory: () => ({
                    connection: {
                      host: '0.0.0.0',
                      port: 6380,
                    },
                  }),
                },
                {
                  name: 'test2',
                  useFactory: () => ({
                    connection: {
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
        it('should inject the flowProducer with name "test1"', () => {
          const flowProducer: FlowProducer = moduleRef.get<FlowProducer>(
            getFlowProducerToken('test1'),
          );
          expect(flowProducer).toBeDefined();
          expect((flowProducer.opts as any).name).toEqual('test1');
        });
        it('should inject the flowProducer with name "test2"', () => {
          const flowProducer: FlowProducer = moduleRef.get<FlowProducer>(
            getFlowProducerToken('test2'),
          );
          expect(flowProducer).toBeDefined();
          expect((flowProducer.opts as any).name).toEqual('test2');
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
                  connection: {
                    host: '0.0.0.0',
                    port: 6380,
                  },
                }),
              }),
              BullModule.registerQueueAsync({
                name: 'test',
                useFactory: () => ({
                  processors: [
                    async (_) => {
                      processorWasCalled = true;
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
          const queueEvents = new QueueEvents('test', {
            connection: {
              host: '0.0.0.0',
              port: 6380,
            },
          });
          const queue = moduleRef.get<Queue>(getQueueToken('test'));
          const job = await queue.add('job_name', { test: true });
          await job.waitUntilFinished(queueEvents, 3000).catch(console.error);

          expect(processorWasCalled).toBeTruthy();

          await queueEvents.close();
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
                  connection: {
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
                  connection: {
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
                  connection: {
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
      const processorCalledSpy = jest.fn();
      const queueCompletedEventSpy = jest.fn();
      const workerCompletedEventSpy = jest.fn();

      @QueueEventsListener(queueName)
      class EventsListener extends QueueEventsHost {
        @OnQueueEvent('completed')
        onCompleted() {
          queueCompletedEventSpy();
        }
      }

      @Processor(queueName)
      class TestProcessor extends WorkerHost {
        async process(job: Job<any, any, string>): Promise<any> {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          processorCalledSpy();
        }

        @OnWorkerEvent('completed')
        onCompleted() {
          workerCompletedEventSpy();
        }
      }

      Test.createTestingModule({
        imports: [
          BullModule.registerQueue({
            name: queueName,
            connection: {
              host: '0.0.0.0',
              port: 6380,
            },
          }),
        ],
        providers: [EventsListener, TestProcessor],
      })
        .compile()
        .then(async (testingModule) => {
          await testingModule.init();

          const queue = testingModule.get<Queue>(getQueueToken(queueName));
          const queueEvents = testingModule.get(EventsListener).queueEvents;

          const job = await queue.add('job_name', { test: true });
          await job.waitUntilFinished(queueEvents, 5000).catch(console.error);

          await testingModule.close();

          expect(processorCalledSpy).toHaveBeenCalled();
          expect(queueCompletedEventSpy).toHaveBeenCalled();
          expect(workerCompletedEventSpy).toHaveBeenCalled();
          done();
        });
    });
  });

  describe('manual registration', () => {
    const queueName = 'a_queue';

    it('should manually register workers - forRoot', (done) => {
      const processorCalledSpy = jest.fn();
      const queueCompletedEventSpy = jest.fn();
      const workerCompletedEventSpy = jest.fn();

      @QueueEventsListener(queueName)
      class EventsListener extends QueueEventsHost {
        @OnQueueEvent('completed')
        onCompleted() {
          queueCompletedEventSpy();
        }
      }

      @Processor(queueName)
      class TestProcessor extends WorkerHost {
        async process(job: Job<any, any, string>): Promise<any> {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          processorCalledSpy();
        }

        @OnWorkerEvent('completed')
        onCompleted() {
          workerCompletedEventSpy();
        }
      }

      Test.createTestingModule({
        imports: [
          BullModule.forRoot({
            connection: {
              host: '0.0.0.0',
              port: 6380,
            },
            extraOptions: {
              manualRegistration: true,
            },
          }),
          BullModule.registerQueue({
            name: queueName,
          }),
        ],
        providers: [EventsListener, TestProcessor],
      })
        .compile()
        .then(async (testingModule) => {
          await testingModule.init();

          expect(() => testingModule.get(TestProcessor).worker).toThrow(
            '"Worker" has not yet been initialized. Make sure to interact with worker instances after the "onModuleInit" lifecycle hook is triggered for example, in the "onApplicationBootstrap" hook, or if manualRegistration is true make sure that to call "BullRegistrator.register()"',
          );
          expect(() => testingModule.get(EventsListener).queueEvents).toThrow(
            '"QueueEvents" class has not yet been initialized. Make sure to interact with queue events instances after the "onModuleInit" lifecycle hook is triggered, for example, in the "onApplicationBootstrap" hook, or if manualRegistration is true make sure that to call "BullRegistrator.register()"',
          );

          const bullRegistrator = testingModule.get(BullRegistrator);
          bullRegistrator.register();

          const processorWorker = testingModule.get(TestProcessor).worker;
          const queueEvents = testingModule.get(EventsListener).queueEvents;

          expect(processorWorker).toBeDefined();
          expect(queueEvents).toBeDefined();

          await testingModule.close();
          done();
        });
    });

    it('should manually register workers - forRootAsync', (done) => {
      const processorCalledSpy = jest.fn();
      const queueCompletedEventSpy = jest.fn();
      const workerCompletedEventSpy = jest.fn();

      @QueueEventsListener(queueName)
      class EventsListener extends QueueEventsHost {
        @OnQueueEvent('completed')
        onCompleted() {
          queueCompletedEventSpy();
        }
      }

      @Processor(queueName)
      class TestProcessor extends WorkerHost {
        async process(job: Job<any, any, string>): Promise<any> {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          processorCalledSpy();
        }

        @OnWorkerEvent('completed')
        onCompleted() {
          workerCompletedEventSpy();
        }
      }

      Test.createTestingModule({
        imports: [
          BullModule.forRootAsync({
            useFactory: () => ({
              connection: {
                host: '0.0.0.0',
                port: 6380,
              },
            }),
            extraOptions: {
              manualRegistration: true,
            },
          }),
          BullModule.registerQueue({
            name: queueName,
          }),
        ],
        providers: [EventsListener, TestProcessor],
      })
        .compile()
        .then(async (testingModule) => {
          await testingModule.init();

          expect(() => testingModule.get(TestProcessor).worker).toThrow(
            '"Worker" has not yet been initialized. Make sure to interact with worker instances after the "onModuleInit" lifecycle hook is triggered for example, in the "onApplicationBootstrap" hook, or if manualRegistration is true make sure that to call "BullRegistrator.register()"',
          );
          expect(() => testingModule.get(EventsListener).queueEvents).toThrow(
            '"QueueEvents" class has not yet been initialized. Make sure to interact with queue events instances after the "onModuleInit" lifecycle hook is triggered, for example, in the "onApplicationBootstrap" hook, or if manualRegistration is true make sure that to call "BullRegistrator.register()"',
          );

          const bullRegistrator = testingModule.get(BullRegistrator);
          bullRegistrator.register();

          const processorWorker = testingModule.get(TestProcessor).worker;
          const queueEvents = testingModule.get(EventsListener).queueEvents;

          expect(processorWorker).toBeDefined();
          expect(queueEvents).toBeDefined();

          await testingModule.close();
          done();
        });
    });
  });

  describe('handles all kind of valid processors providers', () => {
    @Processor('test_processor_registering')
    class MyProcessorA extends WorkerHost {
      async process(job: Job<any, any, string>): Promise<any> {}
    }

    @Processor('test_processor_registering')
    class MyProcessorB extends WorkerHost {
      async process(job: Job<any, any, string>): Promise<any> {}
    }

    @Processor('test_processor_registering')
    class MyProcessorC extends WorkerHost {
      async process(job: Job<any, any, string>): Promise<any> {}
    }

    let testingModule: TestingModule;

    let metadataScanner: MetadataScanner;

    beforeAll(async () => {
      testingModule = await Test.createTestingModule({
        imports: [
          BullModule.registerQueue({
            name: 'test_processor_registering',
            connection: {
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
          (instanceWrapperInstance: any) =>
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
          (instanceWrapperInstance: any) =>
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
          (instanceWrapperInstance: any) =>
            instanceWrapperInstance.constructor.name === MyProcessorC.name,
        ),
      ).toBeTruthy();
    });
  });
});
