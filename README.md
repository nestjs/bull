<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/core.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>

## Description

[Bull](https://github.com/OptimalBits/bull) module for [Nest](https://github.com/nestjs/nest).

## Installation

```bash
$ npm i --save @nestjs/bull bull
$ npm i --save-dev @types/bull
```

## Quick Start

```ts
import { Body, Controller, Get, Module, Param, Post } from '@nestjs/common';
import { DoneCallback, Job, Queue } from 'bull';
import { BullModule, InjectQueue } from 'nest-bull';

@Controller()
export class AppController {
  constructor(@InjectQueue('store') readonly queue: Queue) {}

  @Post()
  async addJob(@Body() value: any) {
    const job: Job = await this.queue.add(value);
    return job.id;
  }

  @Get(':id')
  async getJob(@Param('id') id: string) {
    return await this.queue.getJob(id);
  }
}

@Module({
  imports: [
    BullModule.register({
      name: 'store', // name of the queue
      redis: {
        port: 6379,
      },
      processors: [
        (job: Job, done: DoneCallback) => {
          done(null, job.data);
        },
      ],
    }),
  ],
  controllers: [AppController],
})
export class ApplicationModule {}
```

## Decorators

This module provides some decorators that will help you to set up your queue listeners.

### @Processor()

The `@Processor()` class decorator is mandatory if you plan to use this package's decorators.

It accepts an optional `QueueDecoratorOptions` argument:

```ts
export interface QueueDecoratorOptions {
  name?: string; // Name of the queue
}
```

However, if you have specified a queue name when registering the module, make sure you also specify it to the decorator. For example, if you were to use the code above for registering BullModule, you will need to add `@Processor('store')` to your class.

### @Process()

The `@Process()` method decorator flags a method as a processing function for the queued jobs.

It accepts an optional `QueueProcessDecoratorOptions` argument:

```ts
export interface QueueProcessDecoratorOptions {
  name?: string; // Name of the job
  concurrency?: number; // Concurrency of the job
}
```

Whenever a job matching the configured `name` (if any) is queued, it will be processed by the decorated method.
Such method is expected to have the following signature `(job: Job, done?: DoneCallback): any`;

### @OnQueueEvent()

The `OnQueueEvent()` method decorator flags a method as an event listener for the related queue.

It requires a `BullQueueEvent` argument:

```ts
export type BullQueueEvent =
  | 'error'
  | 'waiting'
  | 'active'
  | 'stalled'
  | 'progress'
  | 'completed'
  | 'failed'
  | 'paused'
  | 'resumed'
  | 'cleaned'
  | 'drained'
  | 'removed'
  | 'global:error'
  | 'global:waiting'
  | 'global:active'
  | 'global:stalled'
  | 'global:progress'
  | 'global:completed'
  | 'global:failed'
  | 'global:paused'
  | 'global:resumed'
  | 'global:cleaned'
  | 'global:drained'
  | 'global:removed';
```

You can also use the `BullQueueEvents` and `BullQueueGlobalEvents` enums.

Fortunately, there is a shorthand decorator for each of the Bull events:

- `@OnQueueError()`
- `@OnQueueWaiting()`
- `@OnQueueActive()`
- `@OnQueueStalled()`
- `@OnQueueProgress()`
- `@OnQueueCompleted()`
- `@OnQueueFailed()`
- `@OnQueuePaused()`
- `@OnQueueResumed()`
- `@OnQueueCleaned()`
- `@OnQueueDrained()`
- `@OnQueueRemoved()`
- `@OnGlobalQueueError()`
- `@OnGlobalQueueWaiting()`
- `@OnGlobalQueueActive()`
- `@OnGlobalQueueStalled()`
- `@OnGlobalQueueProgress()`
- `@OnGlobalQueueCompleted()`
- `@OnGlobalQueueFailed()`
- `@OnGlobalQueuePaused()`
- `@OnGlobalQueueResumed()`
- `@OnGlobalQueueCleaned()`
- `@OnGlobalQueueDrained()`
- `@OnGlobalQueueRemoved()`

If you need more details about those events, head straight to [Bull's reference doc](https://github.com/OptimalBits/bull/blob/develop/REFERENCE.md#events).

### Example

Here is a pretty self-explanatory example on how this package's decorators should be used.

```ts
import {
  Processor,
  Process,
  OnQueueActive,
  OnQueueEvent,
  BullQueueEvents,
} from '../../lib';
import { NumberService } from './number.service';
import { Job, DoneCallback } from 'bull';

@Processor('queue')
export class MyQueue {
  private readonly logger = new Logger('MyQueue');

  constructor(private readonly service: NumberService) {}

  @Process({ name: 'twice' })
  processTwice(job: Job<number>) {
    return this.service.twice(job.data);
  }

  @Process({ name: 'thrice' })
  processThrice(job: Job<number>, callback: DoneCallback) {
    callback(null, this.service.thrice(job.data));
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }

  @OnQueueEvent(BullQueueEvents.COMPLETED)
  onCompleted(job: Job) {
    this.logger.log(
      `Completed job ${job.id} of type ${job.name} with result ${job.returnvalue}`,
    );
  }
}
```

Adding a job to the queue shown above would be done through code such as the following:

```ts
@Injectable()
export class SomeService {
  constructor(@InjectQueue('queue') readonly queue: Queue) {}

  async addJobTwice(value: number) {
    const job: Job = await this.queue.add('twice', value);
    return job.id;
  }
  
  async addJobThrice(value: number) {
    const job: Job = await this.queue.add('thrice', value);
    return job.id;
  }
}
```

Also make sure you have registered the queue properly, such as the following:

```ts
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'queue',
      redis: {
        port: 6379,
      },
    }),
    ...
  ])
export class MyModule {}
```

## Separate processes

This module allows you to run your job handlers in fork processes.
To do so, add the filesystem path to a file (or more) exporting your processor function to the `processors` property of the BullModule options.
You can read more on this subject in Bull's [documentation](https://github.com/OptimalBits/bull#separate-processes).

Please note that, your function being executed in a fork, Nestjs' DI won't be available.

### Example

```ts
// app.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from 'nest-bull';
import { join } from 'path';

@Module({
  imports: [
    BullModule.register({
      processors: [join(__dirname, 'processor.ts')],
    }),
  ],
})
export class AppModule {}
```

```ts
// processor.ts
import { Job, DoneCallback } from 'bull';

export default function(job: Job, cb: DoneCallback) {
  cb(null, 'It works');
}
```

## People

- Author - [Frederic Woelffel](https://fwoelffel.me)
- Website - [https://nestjs.com](https://nestjs.com/)
