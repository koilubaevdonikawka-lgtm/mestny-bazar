import type { SupabaseConnectionSettings } from "@server/infrastructure/configuration";
import { getServerEnv } from "@server/config/env";

/** Resolved Supabase connection settings for infrastructure adapters. */
export class SupabaseConfiguration {
  readonly url: string;
  readonly anonKey: string;
  readonly serviceRoleKey: string;
  readonly schema: string;
  readonly timeoutMs: number;

  private constructor(settings: SupabaseConnectionSettings) {
    this.url = settings.url;
    this.anonKey = settings.anonKey;
    this.serviceRoleKey = settings.serviceRoleKey;
    this.schema = settings.schema;
    this.timeoutMs = settings.timeoutMs;
    Object.freeze(this);
  }

  static create(settings: SupabaseConnectionSettings): SupabaseConfiguration {
    if (!settings.url?.trim()) {
      throw new Error("SupabaseConfiguration requires url.");
    }
    if (!settings.serviceRoleKey?.trim()) {
      throw new Error("SupabaseConfiguration requires serviceRoleKey.");
    }

    return new SupabaseConfiguration({
      url: settings.url.trim(),
      anonKey: settings.anonKey?.trim() || settings.serviceRoleKey.trim(),
      serviceRoleKey: settings.serviceRoleKey.trim(),
      schema: settings.schema?.trim() || "public",
      timeoutMs: settings.timeoutMs ?? 30_000,
    });
  }

  /** Builds settings from validated server env with optional overrides. */
  static fromEnvironment(overrides: Partial<SupabaseConnectionSettings> = {}): SupabaseConfiguration {
    const env = getServerEnv();
    const serviceRoleKey = overrides.serviceRoleKey ?? env.SUPABASE_SERVICE_ROLE_KEY ?? "";
    const anonKey =
      overrides.anonKey ?? process.env.SUPABASE_PUBLISHABLE_KEY ?? serviceRoleKey;

    return SupabaseConfiguration.create({
      url: overrides.url ?? env.SUPABASE_URL,
      anonKey,
      serviceRoleKey,
      schema: overrides.schema ?? "public",
      timeoutMs: overrides.timeoutMs ?? 30_000,
    });
  }

  /** Converts back to plain settings for ConfigurationProvider.snapshot(). */
  toConnectionSettings(): SupabaseConnectionSettings {
    return Object.freeze({
      url: this.url,
      anonKey: this.anonKey,
      serviceRoleKey: this.serviceRoleKey,
      schema: this.schema,
      timeoutMs: this.timeoutMs,
    });
  }
}
