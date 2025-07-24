import { Injectable } from '@nestjs/common';
import { Processor } from 'bullmq';

@Injectable()
export class ProcessorDecoratorService {
  /**
   * Decorates a processor function.
   * This method can be overridden to provide custom behavior for processor decoration.
   *
   * @param processor The processor function to decorate
   * @returns The decorated processor function
   */
  decorate(
    processor: Processor<unknown, unknown>,
  ): Processor<unknown, unknown> {
    return processor;
  }
}
