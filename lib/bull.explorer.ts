import {Injectable as InjectableDecorator, Type} from '@nestjs/common';
import {ModulesContainer, ModuleRef} from '@nestjs/core';
import {InstanceWrapper} from '@nestjs/core/injector/instance-wrapper';
import {Module} from '@nestjs/core/injector/module';
import {BULL_MODULE_QUEUE_LISTENER, BULL_MODULE_PROCESS} from './bull.constants';
import {Injectable} from '@nestjs/common/interfaces';
import {MetadataScanner} from '@nestjs/core/metadata-scanner';
import {getQueueToken} from './bull.utils';
import {Queue} from 'bull';

@InjectableDecorator()
export class BullExplorer {

    constructor(
        private readonly  moduleRef: ModuleRef,
        private readonly  modulesContainer: ModulesContainer
    ) {}

    explore() {
        const components = BullExplorer.getDecoratedComponents([...this.modulesContainer.values()]);
        components.map((wrapper: InstanceWrapper) => {
            const { instance, metatype } = wrapper;
            const queue = BullExplorer.getBullQueue(this.moduleRef, BullExplorer.getClassMetadata(metatype).queueName);
            const processorMethodKeys = BullExplorer.getProcessorMethods(instance);
            for (const key of processorMethodKeys) {
                const options = BullExplorer.getMethodMetadata(instance, key) || {};
                queue.process(options.name, options.concurrency, instance[key].bind(instance));
            }
        });
    }

    private static isClassDecorated(metatype: Type<Injectable>): boolean {
        return Reflect.hasMetadata(BULL_MODULE_QUEUE_LISTENER, metatype);
    }

    private static getClassMetadata(metatype: Type<Injectable>): any {
        return Reflect.getMetadata(BULL_MODULE_QUEUE_LISTENER, metatype);
    }

    private static isMethodDecoratedAsProcessor(instance: Injectable, methodKey: string): boolean {
        return Reflect.hasMetadata(BULL_MODULE_PROCESS, instance, methodKey);
    }

    private static getMethodMetadata(instance: Injectable, methodKey: string): any {
        return Reflect.getMetadata(BULL_MODULE_PROCESS, instance, methodKey);
    }

    private static getBullQueue(moduleRef: ModuleRef, queueName?: string): Queue {
        return moduleRef.get<Queue>(getQueueToken(queueName));
    }

    private static getProcessorMethods(instance: Injectable): string[] {
        return new MetadataScanner()
            .scanFromPrototype(
                instance,
                Object.getPrototypeOf(instance),
                (key: string) => {
                    return BullExplorer.isMethodDecoratedAsProcessor(instance, key)
                        ? key
                        : null;
                }
            );
    }

    private static getDecoratedComponents(modules: Module[]): InstanceWrapper<Injectable>[] {
        return modules
            .map((module: Module): Map<string, InstanceWrapper<Injectable>> => module.components)
            .reduce((acc, map) => {
                acc.push(...map.values());
                return acc;
            }, [])
            .filter((wrapper: InstanceWrapper) => wrapper.metatype && BullExplorer.isClassDecorated(wrapper.metatype));
    }
}
