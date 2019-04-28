import { Injectable } from '@nestjs/common';
import { ModuleRef, ModulesContainer } from '@nestjs/core';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Controller } from '@nestjs/common/interfaces';
import { getQueueToken, PatternProperties } from './index';
import { DoneCallback, Job, Queue } from 'bull';
import { PROCESS_QUEUE_HANDLER_METADATA } from './bull.decorators';
import { Observable, of } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { isFunction } from '@nestjs/common/utils/shared.utils';
import { catchError } from 'rxjs/operators';

@Injectable()
export class BullService {
  private readonly metadataScanner: MetadataScanner = new MetadataScanner();

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly modulesContainer: ModulesContainer,
  ) {
  }

  private exploreMethodMetadata(
    instance: object,
    instancePrototype: any,
    methodKey: string,
  ): PatternProperties {
    const targetCallback = instancePrototype[methodKey];
    const pattern = Reflect.getMetadata(
      PROCESS_QUEUE_HANDLER_METADATA,
      targetCallback,
    );
    if (!pattern) {
      return;
    }
    return {
      methodKey,
      targetCallback: targetCallback.bind(instancePrototype),
      pattern,
    };
  }

  explorer() {
    [...this.modulesContainer.values()]
      .map(module => module.controllers)
      .filter(controllers => controllers.size > 0)
      .reduce((acum, controllers: Map<string, InstanceWrapper<Controller>>) => {
        controllers.forEach(wrapper => acum.push(wrapper));
        return acum;
      }, [])
      .map((instanceWrapper: InstanceWrapper<Controller>): PatternProperties[] => {
        const { instance } = instanceWrapper;
        const instancePrototype = Object.getPrototypeOf(instance);
        return this.metadataScanner.scanFromPrototype<Controller,
          PatternProperties>(instance, instancePrototype, (methodKey) => {
          return this.exploreMethodMetadata(instance, instancePrototype, methodKey);
        });
      })
      .reduce((acum, callData) => {
        return (acum.push(...callData), true) && acum;
      }, [])
      .forEach(patternProperties => {
        try {
          const queue: Queue = this.moduleRef.get<Queue>(getQueueToken(patternProperties.pattern));
          queue.process(async (job: Job, done: DoneCallback) => {
            const response$ = this.transformToObservable(
              await patternProperties.targetCallback(job),
            ) as Observable<any>;

            response$.pipe(
              catchError((err: any) => {
                done(err);
                return err;
              }),
            ).subscribe(result => done(null, result));
          });
        } catch (e) {
        }
      });
  }

  private transformToObservable<T = any>(resultOrDeffered: any): Observable<T> {
    if (resultOrDeffered instanceof Promise) {
      return fromPromise(resultOrDeffered);
    } else if (!(resultOrDeffered && isFunction(resultOrDeffered.subscribe))) {
      return of(resultOrDeffered);
    }
    return resultOrDeffered;
  }
}
