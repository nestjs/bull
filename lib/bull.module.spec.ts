import { BullModule, getQueueToken } from '../lib';
import { Queue } from 'bull';
import { Test, TestingModule } from '@nestjs/testing';

describe('BullModule', () => {
  let module: TestingModule;

  describe('forRoot', () => {
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

  describe('forRootAsync', () => {
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
    });
  });

  describe('#13 Async configuration does not allow an array of BullModuleOptions[]', () => {
    beforeAll(async () => {
      module = await Test.createTestingModule({
        imports: [
          BullModule.forRootAsync({
            useFactory: async () => {
              return [
                {
                  name: 'test1',
                },
                {
                  name: 'test2',
                },
              ];
            },
          }),
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
