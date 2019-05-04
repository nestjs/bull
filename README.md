<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="http://kamilmysliwiec.com/public/nest-logo.png#1" alt="Nest Logo" /></a>
</p>

[travis-image]: https://api.travis-ci.org/nestjs/nest.svg?branch=master
[travis-url]: https://travis-ci.org/nestjs/nest
[linux-image]: https://img.shields.io/travis/nestjs/nest/master.svg?label=linux
[linux-url]: https://travis-ci.org/nestjs/nest
  
  <p align="center">A progressive <a href="http://nodejs.org" target="blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/v/@nestjs/typeorm.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/dm/@nestjs/typeorm.svg" alt="NPM Downloads" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://api.travis-ci.org/nestjs/nest.svg?branch=master" alt="Travis" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://img.shields.io/travis/nestjs/nest/master.svg?label=linux" alt="Linux" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#2" alt="Coverage" /></a>
<a href="https://gitter.im/nestjs/nestjs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=body_badge"><img src="https://badges.gitter.im/nestjs/nestjs.svg" alt="Gitter" /></a>
<a href="https://opencollective.com/nest#backer"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

- [Description](#description)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Decorators](#decorators)
  - [@Queue()](#queue)
  - [@QueueProcess()](#queueprocess)
  - [@OnQueueEvent()](#onqueueevent)
  - [Example](#example)
- [People](#people)

## Description

This is a [Bull](https://github.com/OptimalBits/bull) module for [Nest](https://github.com/nestjs/nest).

## Installation

```bash
$ npm i --save nest-bull bull
$ npm i --save-dev @types/bull
```

## Quick Start

```ts
import {Body, Controller, Get, Module, Param, Post} from '@nestjs/common';
import {DoneCallback, Job, Queue} from 'bull';
import {BullModule, InjectQueue} from 'nest-bull';

@Controller()
export class AppController {

  constructor(
    @InjectQueue('store') readonly queue: Queue,
  ) {}

  @Post()
  async addJob( @Body() value: any ) {
    const job: Job = await this.queue.add(value);
    return job.id;
  }

  @Get(':id')
  async getJob( @Param('id') id: string ) {
    return await this.queue.getJob(id);
  }
}

@Module({
  imports: [
    BullModule.forRoot({
      name: 'store',
      options: {
        redis: {
          port: 6379,
        },
      },
      processors: [
        (job: Job, done: DoneCallback) => { done(null, job.data); },
      ],
    }),
  ],
  controllers: [
    AppController,
  ],
})
export class ApplicationModule {}
```

## Decorators

This module provides some decorators that will help you to set up your queue listeners.

### @Queue()

The `@Queue()` class decorator is mandatory if you plan to use this package's decorators.

It accepts an optional `QueueDecoratorOptions` argument:
````ts
export interface QueueDecoratorOptions {
  name?: string; // Name of the queue
}
````

### @QueueProcess()

The `@QueueProcess()` method decorator flags a method as a processing function for the queued jobs.

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
import {Queue, QueueProcess, OnQueueActive, OnQueueEvent, BullQueueEvents} from '../../lib';
import {NumberService} from './number.service';
import {Job, DoneCallback} from 'bull';

@Queue()
export class MyQueue {
  private readonly logger = new Logger('MyQueue');

  constructor(private readonly service: NumberService) {}

  @QueueProcess({ name: 'twice' })
  processTwice(job: Job<number>) {
    return this.service.twice(job.data);
  }

  @QueueProcess({ name: 'thrice' })
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

## People

- Author - [Frederic Woelffel](https://fwoelffel.me)
- Website - [https://nestjs.com](https://nestjs.com/)
