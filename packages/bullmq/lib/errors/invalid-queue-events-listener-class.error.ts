/**
 * @publicApi
 */
export class InvalidQueueEventsListenerClassError extends Error {
  constructor(className: string) {
    super(
      `Queue events listener class ("${className}") should inherit from the abstract "QueueEventsHost" class.`,
    );
  }
}
