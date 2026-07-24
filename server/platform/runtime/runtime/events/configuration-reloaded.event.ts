export const ConfigurationReloadedEventName = "platform.runtime.configuration.reloaded";

export interface ConfigurationReloadedEvent {
  readonly name: typeof ConfigurationReloadedEventName;
  readonly occurredAt: string;
  readonly source: string;
}

export function createConfigurationReloadedEvent(source: string): ConfigurationReloadedEvent {
  return Object.freeze({
    name: ConfigurationReloadedEventName,
    occurredAt: new Date().toISOString(),
    source: source.trim(),
  });
}
