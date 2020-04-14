import * as bullProviders from '../bull.providers';
import { BullModuleOptions } from '../interfaces/bull-module-options.interface';

describe('Providers', () => {
  describe('createQueueProviders', () => {
    it("should use top-level queue name if it's not specified in factory options", () => {
      const moduleOptions: BullModuleOptions = { name: 'top-level-queue-name' };
      const factoryModuleOptions: BullModuleOptions = {};
      const provider = bullProviders.createQueueProviders([moduleOptions])[0];

      expect(provider.useFactory(factoryModuleOptions).name).toEqual(
        moduleOptions.name,
      );

      factoryModuleOptions.name = 'low-level-queue-name';
      expect(provider.useFactory(factoryModuleOptions).name).toEqual(
        factoryModuleOptions.name,
      );
    });
  });
});
