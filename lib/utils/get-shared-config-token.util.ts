export const BULL_CONFIG_DEFAULT_TOKEN = 'BULL_CONFIG(default)';

export function getSharedConfigToken(configKey?: string): string {
  return configKey ? `BULL_CONFIG(${configKey})` : BULL_CONFIG_DEFAULT_TOKEN;
}
