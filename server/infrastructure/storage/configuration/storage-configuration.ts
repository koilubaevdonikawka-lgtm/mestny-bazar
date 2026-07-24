import type { StorageConnectionSettings } from "@server/infrastructure/configuration";
import { getServerEnv } from "@server/config/env";

/** Resolved storage connection settings for infrastructure adapters. */
export class StorageConfiguration {
  readonly provider: StorageConnectionSettings["provider"];
  readonly bucket: string;
  readonly baseUrl: string;
  readonly publicUrl: string;
  readonly timeoutMs: number;
  readonly accessKey?: string;

  private constructor(settings: StorageConnectionSettings) {
    this.provider = settings.provider;
    this.bucket = settings.bucket;
    this.baseUrl = settings.baseUrl.replace(/\/+$/, "");
    this.publicUrl = settings.publicUrl.replace(/\/+$/, "");
    this.timeoutMs = settings.timeoutMs;
    this.accessKey = settings.accessKey;
    Object.freeze(this);
  }

  static create(settings: StorageConnectionSettings): StorageConfiguration {
    if (!settings.bucket?.trim()) {
      throw new Error("StorageConfiguration requires bucket.");
    }
    if (!settings.baseUrl?.trim()) {
      throw new Error("StorageConfiguration requires baseUrl.");
    }
    if (!settings.publicUrl?.trim()) {
      throw new Error("StorageConfiguration requires publicUrl.");
    }

    return new StorageConfiguration({
      provider: settings.provider,
      bucket: settings.bucket.trim(),
      baseUrl: settings.baseUrl.trim(),
      publicUrl: settings.publicUrl.trim(),
      timeoutMs: settings.timeoutMs ?? 30_000,
      accessKey: settings.accessKey?.trim() || undefined,
    });
  }

  static fromEnvironment(
    overrides: Partial<StorageConnectionSettings> = {},
  ): StorageConfiguration {
    const env = getServerEnv();
    const provider =
      overrides.provider ??
      (process.env.STORAGE_PROVIDER as StorageConnectionSettings["provider"] | undefined) ??
      "local";
    const supabaseUrl = env.SUPABASE_URL.replace(/\/+$/, "");

    const baseUrl =
      overrides.baseUrl ??
      process.env.STORAGE_BASE_URL ??
      (provider === "supabase" ? supabaseUrl : ".storage");

    const publicUrl =
      overrides.publicUrl ??
      process.env.STORAGE_PUBLIC_URL ??
      (provider === "supabase"
        ? `${supabaseUrl}/storage/v1/object/public/${overrides.bucket ?? process.env.STORAGE_BUCKET ?? "marketplace"}`
        : `${env.APP_URL ?? "http://localhost:3000"}/storage`);

    return StorageConfiguration.create({
      provider,
      bucket: overrides.bucket ?? process.env.STORAGE_BUCKET ?? "marketplace",
      baseUrl,
      publicUrl,
      timeoutMs: overrides.timeoutMs ?? 30_000,
      accessKey:
        overrides.accessKey ??
        env.SUPABASE_SERVICE_ROLE_KEY ??
        process.env.STORAGE_ACCESS_KEY,
    });
  }

  toConnectionSettings(): StorageConnectionSettings {
    return Object.freeze({
      provider: this.provider,
      bucket: this.bucket,
      baseUrl: this.baseUrl,
      publicUrl: this.publicUrl,
      timeoutMs: this.timeoutMs,
      accessKey: this.accessKey,
    });
  }

  objectPublicUrl(key: string): string {
    const normalizedKey = key.replace(/^\/+/, "");
    return `${this.publicUrl}/${normalizedKey}`;
  }
}
