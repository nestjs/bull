export const NO_QUEUE_FOUND = (name?: string) =>
  name
    ? `No Queue was found with the given name (${name}). Check your configuration.`
    : 'No Queue was found. Check your configuration.';
