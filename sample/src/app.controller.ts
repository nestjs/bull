import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { InjectQueue } from 'nest-bull';
import { Queue } from 'bull';

@Controller()
export class AppController {
  constructor(@InjectQueue() private readonly queue: Queue) {}

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
