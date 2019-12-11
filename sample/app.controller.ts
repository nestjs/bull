import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from 'nest-bull';

@Controller()
export class AppController {
  constructor(@InjectQueue('test_queue') private readonly queue: Queue) {}

  @Get('twice/:x')
  async createTwiceJob(@Param('x', new ParseIntPipe()) x: number) {
    return {
      message: 'Twice job created',
      data: await this.queue.add('twice', x),
    };
  }

  @Get('thrice/:x')
  async createThriceJob(@Param('x', new ParseIntPipe()) x: number) {
    return {
      message: 'Thrice job created',
      data: await this.queue.add('thrice', x),
    };
  }
}
