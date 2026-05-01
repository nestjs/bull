import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { BULL_EXTRA_OPTIONS_TOKEN } from './bull.constants.js';
import { BullExplorer } from './bull.explorer.js';
import { BullModuleExtraOptions } from './interfaces/index.js';

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
