export const BULL_CONFIG_DEFAULT_TOKEN = 'BULLMQ_CONFIG(default)';

export function getSharedConfigToken(configKey?: string): string {
  return configKey ? `BULLMQ_CONFIG(${configKey})` : BULL_CONFIG_DEFAULT_TOKEN;
}
