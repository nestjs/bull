/**
 * @publicApi
 */
export class InvalidProcessorClassError extends Error {
  constructor(className: string) {
    super(
      `Processor class ("${className}") should inherit from the abstract "WorkerHost" class.`,
    );
  }
}
