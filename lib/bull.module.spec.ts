import { BullModule, getQueueToken } from '../lib';
import { Queue } from 'bull';
import { Test, TestingModule } from '@nestjs/testing';
import { BullOptionsFactory, BullModuleOptions } from './bull.interfaces';

describe('BullModule', () => {
  let module: TestingModule;
  describe('forRoot', () => {
    describe('single configuration', () => {
      const fakeProcessor = jest.fn();
      beforeAll(async () => {
        module = await Test.createTestingModule({
          imports: [
            BullModule.forRoot({
              name: 'test',
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
          imports: [BullModule.forRoot([{ name: 'test1' }, { name: 'test2' }])],
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
  describe('forRootAsync', () => {
    describe('single configuration', () => {
      describe('useFactory', () => {
        const fakeProcessor = jest.fn();
        beforeAll(async () => {
          module = await Test.createTestingModule({
            imports: [
              BullModule.forRootAsync({
                name: 'test',
                useFactory: () => ({
                  processors: [fakeProcessor],
                }),
              }),
            ],
          }).compile();
        });
        it('should inject the queue with the given name', () => {
          const queue: Queue = module.get<Queue>(getQueueToken('test'));
          expect(queue).toBeDefined();
        });
        it('the injected queue should have the given processor', async () => {
          const queue: Queue = module.get<Queue>(getQueueToken('test'));
          await queue.add(null);
          return new Promise(resolve => {
            setTimeout(() => {
              expect(fakeProcessor).toHaveBeenCalledTimes(1);
              resolve();
            }, 100);
          });
        });
      });
      describe('useClass', () => {
        const fakeProcessor = jest.fn();
        class OptionsMock implements BullOptionsFactory {
          createBullOptions(): BullModuleOptions {
            return {
              processors: [fakeProcessor],
            };
          }
        }
        beforeAll(async () => {
          module = await Test.createTestingModule({
            imports: [
              BullModule.forRootAsync({
                name: 'test',
                useClass: OptionsMock
              }),
            ],
          }).compile();
        });
        it('should inject the queue with the given name', async () => {
          const queue: Queue = module.get<Queue>(getQueueToken('test'));
          expect(queue).toBeDefined();
        });
        it('the injected queue should have the given processor', async () => {
          const queue: Queue = module.get<Queue>(getQueueToken('test'));
          await queue.add(null);
          return new Promise(resolve => {
            setTimeout(() => {
              expect(fakeProcessor).toHaveBeenCalledTimes(1);
              resolve();
            }, 100);
          });
        });
      });
    });
    describe('multiple configuration', () => {
      describe('useFactory', () => {
        beforeAll(async () => {
          module = await Test.createTestingModule({
            imports: [
              BullModule.forRootAsync([
                { name: 'test1', useFactory: () => ({}) },
                { name: 'test2', useFactory: () => ({}) },
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
