import { BullModule, getQueueToken } from '.';
import { Queue } from 'bull';
import { Test, TestingModule } from '@nestjs/testing';
import { Module } from '@nestjs/common';
import { Processor, InjectQueue } from './bull.decorators';

@Processor()
class SubTaskService {
  constructor(
    @InjectQueue('test')
    public readonly queue: Queue,
  ) {}
}

@Module({
  providers: [SubTaskService],
})
class SubTaskModule {}

@Processor()
class TaskService {
  constructor(
    @InjectQueue('test')
    public readonly queue: Queue,
  ) {}
}

@Module({
  imports: [SubTaskModule],
  providers: [TaskService],
})
class TaskModule {}

describe('GlobalModule', () => {
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        BullModule.register({
          name: 'test',
        }),
        TaskModule,
      ],
    }).compile();
  });
  it('should inject the queue in the parallel module', () => {
    const taskService: TaskService = module.get<TaskService>(TaskService);
    expect(taskService.queue).toBeDefined();
  });
  it('should inject the queue in the nested module', () => {
    const subTaskService: SubTaskService = module.get<SubTaskService>(
      SubTaskService,
    );
    expect(subTaskService.queue).toBeDefined();
  });
});
