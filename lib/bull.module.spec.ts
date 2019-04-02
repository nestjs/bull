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
});
