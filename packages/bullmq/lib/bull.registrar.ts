import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { BULL_EXTRA_OPTIONS_TOKEN } from './bull.constants';
import { BullExplorer } from './bull.explorer';
import { BullModuleExtraOptions } from './interfaces';

@Injectable()
export class BullRegistrar implements OnModuleInit {
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly bullExplorer: BullExplorer,
  ) {}

  onModuleInit() {
    const extraOptions = this.getModuleExtras();

    if (extraOptions?.manualRegistration) {
      return;
    }

    this.register();
  }

  register() {
    return this.bullExplorer.register();
  }

  private getModuleExtras(): BullModuleExtraOptions | null {
    try {
      const extrasToken = BULL_EXTRA_OPTIONS_TOKEN;
      return this.moduleRef.get<BullModuleExtraOptions>(extrasToken, {
        strict: false,
      });
    } catch {
      return null;
    }
  }
}
