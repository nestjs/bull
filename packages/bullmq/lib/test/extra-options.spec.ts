import { Test, TestingModule } from '@nestjs/testing';
import { BullExplorer } from '../bull.explorer.js';
import { BullModule } from '../index.js';

vi.mock('bullmq', async (importOriginal) => {
  const actual = await importOriginal<typeof import('bullmq')>();
  return {
    ...actual,
    Queue: class {
      opts: any;
      constructor(name: string, opts?: any) {
        this.opts = opts;
      }
      close = vi.fn().mockResolvedValue(undefined);
    },
  };
});

describe('extraOptions', () => {
  let moduleRef: TestingModule;
  let registerSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    registerSpy = vi
      .spyOn(BullExplorer.prototype, 'register')
      .mockImplementation(() => undefined);
  });

  afterEach(async () => {
    registerSpy.mockRestore();
    await moduleRef?.close();
  });

  const withManualRegistration = () =>
    BullModule.forRoot({
      connection: {},
      extraOptions: { manualRegistration: true },
    });

  it('should honor "manualRegistration" when a named config is registered after the default one', async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        withManualRegistration(),
        BullModule.forRoot('other', { connection: {} }),
        BullModule.registerQueue({ name: 'test' }),
      ],
    }).compile();
    await moduleRef.init();

    expect(registerSpy).not.toHaveBeenCalled();
  });

  it('should honor "manualRegistration" when a named async config is registered after the default one', async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        withManualRegistration(),
        BullModule.forRootAsync('other', {
          useFactory: () => ({ connection: {} }),
        }),
        BullModule.registerQueue({ name: 'test' }),
      ],
    }).compile();
    await moduleRef.init();

    expect(registerSpy).not.toHaveBeenCalled();
  });

  it('should honor "manualRegistration" when a named config is registered before the default one', async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        BullModule.forRoot('other', { connection: {} }),
        withManualRegistration(),
        BullModule.registerQueue({ name: 'test' }),
      ],
    }).compile();
    await moduleRef.init();

    expect(registerSpy).not.toHaveBeenCalled();
  });

  it('should register workers automatically when "extraOptions" are not set', async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        BullModule.forRoot({ connection: {} }),
        BullModule.forRoot('other', { connection: {} }),
        BullModule.registerQueue({ name: 'test' }),
      ],
    }).compile();
    await moduleRef.init();

    expect(registerSpy).toHaveBeenCalledTimes(1);
  });
});
