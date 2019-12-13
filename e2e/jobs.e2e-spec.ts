import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bull';
import { BullModule, getQueueToken } from '../lib';

describe('BullModule', () => {
  let testingModule: TestingModule;

  const fakeProcessor = jest.fn();
  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      imports: [
        BullModule.register({
          name: 'test',
          options: {
            redis: {
              host: '0.0.0.0',
              port: 6380,
            },
          },
          processors: [fakeProcessor],
        }),
      ],
    }).compile();
  });

  it('should process jobs with the given processors', async () => {
    const queue: Queue = testingModule.get<Queue>(getQueueToken('test'));
    await queue.add(null);
    return new Promise(resolve => {
      setTimeout(() => {
        expect(fakeProcessor).toHaveBeenCalledTimes(1);
        resolve();
      }, 100);
    });
  });
});
