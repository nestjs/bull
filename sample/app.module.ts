import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { NumberService } from './number.service';
import { MyQueue } from './my-queue';
import { BullModule } from 'nest-bull';

@Module({
  imports: [BullModule.forRoot({ name: 'test_queue' })],
  controllers: [AppController],
  providers: [NumberService, MyQueue],
})
export class AppModule {}
