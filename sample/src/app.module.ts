import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { NumberService } from './number.service';
import { MyQueue } from './my-queue';
import { BullModule } from 'nest-bull';

@Module({
  imports: [BullModule.forRoot({})],
  controllers: [AppController],
  providers: [NumberService, MyQueue],
})
export class AppModule {}
