export type ConfigurationSource = "environment" | "composition-root" | "vault" | "cloud-secret-manager";

export interface ConfigurationSnapshot {
  readonly source: ConfigurationSource;
  readonly loadedAt: string;
  readonly values: Readonly<Record<string, unknown>>;
}

export function createConfigurationSnapshot(input: {
  source: ConfigurationSource;
  values: Readonly<Record<string, unknown>>;
}): ConfigurationSnapshot {
  return Object.freeze({
    source: input.source,
    loadedAt: new Date().toISOString(),
    values: Object.freeze({ ...input.values }),
  });
}
