import { Injectable, OnModuleInit } from '@nestjs/common';
import { BullExplorer } from './bull.explorer';
import { ModuleRef } from '@nestjs/core';
import { BullModuleExtraOptions } from './interfaces';
import { getExtraOptionToken } from './utils/get-extra-options-token.util';

@Injectable()
export class BullRegistrator implements OnModuleInit {
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly bullExplorer: BullExplorer,
  ) {}

  private getExtraOption(): BullModuleExtraOptions | null {
    try {
      const extraOptionsToken = getExtraOptionToken();
      return this.moduleRef.get<BullModuleExtraOptions>(extraOptionsToken, {
        strict: false,
      });
    } catch {
      return null;
    }
  }

  onModuleInit() {
    const extraOptions = this.getExtraOption();

    if (!extraOptions) {
      this.register();
    } else if (!extraOptions.manualRegistration) {
      this.register();
    }
  }

  register() {
    this.bullExplorer.register();
  }
}
