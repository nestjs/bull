import {Injectable as InjectableDecorator, Type} from '@nestjs/common';
import {ModulesContainer, ModuleRef} from '@nestjs/core';
import {InstanceWrapper} from '@nestjs/core/injector/instance-wrapper';
import {Module} from '@nestjs/core/injector/module';
import {BULL_MODULE_QUEUE, BULL_MODULE_QUEUE_PROCESS, BULL_MODULE_ON_QUEUE_EVENT,} from './bull.constants';
import {Injectable} from '@nestjs/common/interfaces';
import {MetadataScanner} from '@nestjs/core/metadata-scanner';
import {getQueueToken} from './bull.utils';
import {Queue} from 'bull';

@InjectableDecorator()
export class BullExplorer {
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly modulesContainer: ModulesContainer,
  ) {}

  explore() {
    const components = BullExplorer.getDecoratedComponents([
      ...this.modulesContainer.values(),
    ]);
    components.map((wrapper: InstanceWrapper) => {
      const { instance, metatype } = wrapper;
      const queue = BullExplorer.getBullQueue(
        this.moduleRef,
        BullExplorer.getClassMetadata(metatype).name,
      );
      new MetadataScanner().scanFromPrototype(
        instance,
        Object.getPrototypeOf(instance),
        (key: string) => {
          if (BullExplorer.isMethodDecoratedAsProcessor(instance, key)) {
            const options =
              BullExplorer.getProcessorMetadata(instance, key) || {};
            options.name && options.concurrency
              ? queue.process(
              options.name,
              options.concurrency,
              instance[key].bind(instance),
              )
              : options.name
              ? queue.process(options.name, instance[key].bind(instance))
              : options.concurrency
                ? queue.process(options.concurrency, instance[key].bind(instance))
                : queue.process(instance[key].bind(instance));
          } else if (
            BullExplorer.isMethodDecoratedAsEventListener(instance, key)
          ) {
            const options =
              BullExplorer.getEventListenerMetadata(instance, key) || {};
            queue.on(options.eventName, instance[key].bind(instance));
          }
        },
      );
    });
  }

  private static isClassDecorated(metatype: Type<Injectable>): boolean {
    return Reflect.hasMetadata(BULL_MODULE_QUEUE, metatype);
  }

  private static getClassMetadata(metatype: Type<Injectable>): any {
    return Reflect.getMetadata(BULL_MODULE_QUEUE, metatype);
  }

  private static isMethodDecoratedAsProcessor(
    instance: Injectable,
    methodKey: string,
  ): boolean {
    return Reflect.hasMetadata(BULL_MODULE_QUEUE_PROCESS, instance, methodKey);
  }

  private static isMethodDecoratedAsEventListener(
    instance: Injectable,
    methodKey: string,
  ): boolean {
    return Reflect.hasMetadata(BULL_MODULE_ON_QUEUE_EVENT, instance, methodKey);
  }

  private static getProcessorMetadata(
    instance: Injectable,
    methodKey: string,
  ): any {
    return Reflect.getMetadata(BULL_MODULE_QUEUE_PROCESS, instance, methodKey);
  }

  private static getEventListenerMetadata(
    instance: Injectable,
    methodKey: string,
  ): any {
    return Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, instance, methodKey);
  }

  private static getBullQueue(moduleRef: ModuleRef, queueName?: string): Queue {
    const queue = moduleRef.get<Queue>(getQueueToken(queueName));
    if (!queue) {
      throw new Error(
        queueName
          ? `No Queue was found with the given name (${queueName}). Check your configuration.`
          : 'No Queue was found. Check your configuration.'
      );
    }
    else {
      return queue;
    }
  }

  private static getDecoratedComponents(
    modules: Module[],
  ): InstanceWrapper<Injectable>[] {
    return modules
      .map(
        (module: Module): Map<string, InstanceWrapper<Injectable>> =>
          module.components,
      )
      .reduce((acc, map) => {
        acc.push(...map.values());
        return acc;
      }, [])
      .filter(
        (wrapper: InstanceWrapper) =>
          wrapper.metatype && BullExplorer.isClassDecorated(wrapper.metatype),
      );
  }
}
