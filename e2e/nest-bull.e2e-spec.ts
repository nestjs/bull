import {INestApplication} from '@nestjs/common';
import {BullModule, getQueueToken} from '../lib';
import {Queue} from 'bull';
import {Test} from '@nestjs/testing';

describe('BullModule', () => {

    let app: INestApplication;

    describe('forRoot', () => {
        const fakeProcessor = jest.fn();
        beforeAll(async () => {
            const module = await Test.createTestingModule({
                imports: [ BullModule.forRoot({
                    name: 'test',
                    processors: [ fakeProcessor ],
                }) ],
            }).compile();
            app = module.createNestApplication();
            await app.init();
        });
        it('should inject the queue with the given name', () => {
            const queue: Queue = app.get<Queue>(getQueueToken('test'));
            expect(queue).toBeDefined();
        });
        it('should process jobs with the given processors', async () => {
            const queue: Queue = app.get<Queue>(getQueueToken('test'));
            await queue.add(null);
            return new Promise((resolve) => {
                setTimeout(() => {
                    expect(fakeProcessor).toHaveBeenCalledTimes(1);
                    resolve();
                }, 100);
            });
        });
    });

    describe('forRootAsync', () => {
        describe('useFactory', () => {
            const fakeProcessor = jest.fn();
            beforeAll(async () => {
                const module = await Test.createTestingModule({
                    imports: [ BullModule.forRootAsync({
                        name: 'test',
                        useFactory: () => ({
                            processors: [ fakeProcessor ],
                        }),
                    }) ],
                }).compile();
                app = module.createNestApplication();
                await app.init();
            });
            it('should inject the queue with the given name', () => {
                const queue: Queue = app.get<Queue>(getQueueToken('test'));
                expect(queue).toBeDefined();
            });
            it('should process jobs with the given processors', async () => {
                const queue: Queue = app.get<Queue>(getQueueToken('test'));
                await queue.add(null);
                return new Promise((resolve) => {
                    setTimeout(() => {
                        expect(fakeProcessor).toHaveBeenCalledTimes(1);
                        resolve();
                    }, 100);
                });
            });
        });
    });

});
