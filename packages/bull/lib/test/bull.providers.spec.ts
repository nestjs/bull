import { FactoryProvider } from '@nestjs/common';
import * as bullProviders from '../bull.providers';
import { BullModuleOptions } from '../interfaces/bull-module-options.interface';

jest.mock(
  'bull',
  () =>
    class {
      constructor(public readonly name: string) {}
    },
);

describe('Providers', () => {
  describe('createQueueProviders', () => {
    it("should use top-level queue name if it's not specified in factory options", async () => {
      const moduleOptions: BullModuleOptions = { name: 'top-level-queue-name' };
      const factoryModuleOptions: BullModuleOptions = { redis: { port: 6380 } };
      const provider = bullProviders.createQueueProviders([
        moduleOptions,
      ])[0] as FactoryProvider;

      let queue = provider.useFactory(factoryModuleOptions);
      expect(queue.name).toEqual(moduleOptions.name);

      factoryModuleOptions.name = 'low-level-queue-name';
      queue = provider.useFactory(factoryModuleOptions);
      expect(queue.name).toEqual(factoryModuleOptions.name);
    });
  });
});
