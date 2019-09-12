import {
  Injectable as InjectableDecorator,
  Type,
  Logger,
} from '@nestjs/common';
import { ModulesContainer, ModuleRef, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';
import {
  BULL_MODULE_QUEUE,
  BULL_MODULE_QUEUE_PROCESS,
  BULL_MODULE_ON_QUEUE_EVENT,
} from './bull.constants';
import { Injectable } from '@nestjs/common/interfaces';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { getQueueToken } from './bull.utils';
import { Queue, Job } from 'bull';

@InjectableDecorator()
export class BullExplorer {
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly modulesContainer: ModulesContainer,
    private readonly logger: Logger,
    private readonly reflector: Reflector,
  ) {}

  explore() {
    const components = BullExplorer.getQueueComponents([
      ...this.modulesContainer.values(),
    ]);
    components.map((wrapper: InstanceWrapper) => {
      const { instance, metatype } = wrapper;
      const queueName = BullExplorer.getQueueComponentMetadata(metatype).name;
      const queueToken = getQueueToken(queueName);
      let queue: Queue;
      try {
        queue = BullExplorer.getQueue(this.moduleRef, queueToken);
      } catch (err) {
        this.logger.error(
          queueName
            ? `No Queue was found with the given name (${queueName}). Check your configuration.`
            : 'No Queue was found. Check your configuration.',
        );
        throw err;
      }
      new MetadataScanner().scanFromPrototype(
        instance,
        Object.getPrototypeOf(instance),
        (key: string) => {
          if (BullExplorer.isProcessor(instance[key], this.reflector)) {
            BullExplorer.handleProcessor(
              instance,
              key,
              queue,
              BullExplorer.getProcessorMetadata(instance[key], this.reflector),
            );
          } else if (BullExplorer.isListener(instance[key], this.reflector)) {
            BullExplorer.handleListener(
              instance,
              key,
              queue,
              BullExplorer.getListenerMetadata(instance[key], this.reflector),
            );
          }
        },
      );
    });
  }

  static handleProcessor(instance, key, queue, options?) {
    const args = [
      options ? options.name : undefined,
      options ? options.concurrency : undefined,
      instance[key].bind(instance),
    ].filter(arg => !!arg);
    queue.process(...args);
  }

  static handleListener(instance, key, queue, options) {
    if (options.name || options.id) {
      queue.on(options.eventName, (job: Job, ...args) => {
        if (job.name === options.name || job.id === options.id) {
          return instance[key].apply(instance, [job, ...args]);
        }
      });
    } else {
      queue.on(options.eventName, instance[key].bind(instance));
    }
  }

  static isQueueComponent(
    target: Type<any> | Function,
    reflector: Reflector = new Reflector(),
  ): boolean {
    return !!reflector.get(BULL_MODULE_QUEUE, target);
  }

  static getQueueComponentMetadata(
    target: Type<any> | Function,
    reflector: Reflector = new Reflector(),
  ): any {
    return reflector.get(BULL_MODULE_QUEUE, target);
  }

  static isProcessor(
    target: Type<any> | Function,
    reflector: Reflector = new Reflector(),
  ): boolean {
    return !!reflector.get(BULL_MODULE_QUEUE_PROCESS, target);
  }

  static isListener(
    target: Type<any> | Function,
    reflector: Reflector = new Reflector(),
  ): boolean {
    return !!reflector.get(BULL_MODULE_ON_QUEUE_EVENT, target);
  }

  static getProcessorMetadata(
    target: Type<any> | Function,
    reflector: Reflector = new Reflector(),
  ): any {
    return reflector.get(BULL_MODULE_QUEUE_PROCESS, target);
  }

  static getListenerMetadata(
    target: Type<any> | Function,
    reflector: Reflector = new Reflector(),
  ): any {
    return reflector.get(BULL_MODULE_ON_QUEUE_EVENT, target);
  }

  static getQueue(moduleRef: ModuleRef, queueToken: string): Queue {
    return moduleRef.get<Queue>(queueToken);
  }

  static getQueueComponents(modules: Module[]): InstanceWrapper<Injectable>[] {
    return modules
      .map((module: Module) => module.components)
      .reduce((acc, map) => {
        acc.push(...map.values());
        return acc;
      }, [])
      .filter(
        (wrapper: InstanceWrapper) =>
          wrapper.metatype && BullExplorer.isQueueComponent(wrapper.metatype),
      );
  }
}
