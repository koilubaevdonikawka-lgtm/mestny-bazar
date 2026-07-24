export type PluginStatusValue = "registered" | "installed" | "enabled" | "disabled";

/** Plugin definition — no domain data, no executable code. */
export interface PluginDefinition {
  readonly pluginId: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly source: string;
  readonly status: PluginStatusValue;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface PluginStatus {
  readonly pluginId: string;
  readonly name: string;
  readonly version: string;
  readonly status: PluginStatusValue;
  readonly installed: boolean;
  readonly enabled: boolean;
  readonly updatedAt: string;
}

export interface RegisterPluginInput {
  readonly name: string;
  readonly version: string;
  readonly description?: string;
  readonly source?: string;
}

export interface InstallPluginInput {
  readonly pluginId: string;
}

export interface ListPluginsResult {
  readonly plugins: readonly PluginDefinition[];
  readonly total: number;
}

export function createPluginDefinition(input: {
  pluginId: string;
  name: string;
  version: string;
  description?: string;
  source?: string;
  status?: PluginStatusValue;
  createdAt?: string;
  updatedAt?: string;
}): PluginDefinition {
  const now = new Date().toISOString();
  return Object.freeze({
    pluginId: input.pluginId.trim(),
    name: input.name.trim(),
    version: input.version.trim(),
    description: (input.description ?? "").trim(),
    source: (input.source ?? "local").trim(),
    status: input.status ?? "registered",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}

export function toPluginStatus(plugin: PluginDefinition): PluginStatus {
  return Object.freeze({
    pluginId: plugin.pluginId,
    name: plugin.name,
    version: plugin.version,
    status: plugin.status,
    installed: plugin.status === "installed" || plugin.status === "enabled" || plugin.status === "disabled",
    enabled: plugin.status === "enabled",
    updatedAt: plugin.updatedAt,
  });
}

export function isPluginStatusValue(value: string): value is PluginStatusValue {
  return (
    value === "registered" ||
    value === "installed" ||
    value === "enabled" ||
    value === "disabled"
  );
}
