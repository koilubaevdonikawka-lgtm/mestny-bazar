import type { FinikConnectionSettings } from "@server/infrastructure/configuration";
import { getServerEnv } from "@server/config/env";

/** Resolved Finik connection settings for infrastructure adapters. */
export class FinikConfiguration {
  readonly baseUrl: string;
  readonly merchantId: string;
  readonly secretKey: string;
  readonly callbackUrl: string;
  readonly timeoutMs: number;
  readonly webhookSecret?: string;

  private constructor(settings: FinikConnectionSettings) {
    this.baseUrl = settings.baseUrl.replace(/\/+$/, "");
    this.merchantId = settings.merchantId;
    this.secretKey = settings.secretKey;
    this.callbackUrl = settings.callbackUrl;
    this.timeoutMs = settings.timeoutMs;
    this.webhookSecret = settings.webhookSecret;
    Object.freeze(this);
  }

  static create(settings: FinikConnectionSettings): FinikConfiguration {
    if (!settings.baseUrl?.trim()) {
      throw new Error("FinikConfiguration requires baseUrl.");
    }
    if (!settings.merchantId?.trim()) {
      throw new Error("FinikConfiguration requires merchantId.");
    }
    if (!settings.secretKey?.trim()) {
      throw new Error("FinikConfiguration requires secretKey.");
    }
    if (!settings.callbackUrl?.trim()) {
      throw new Error("FinikConfiguration requires callbackUrl.");
    }

    return new FinikConfiguration({
      baseUrl: settings.baseUrl.trim(),
      merchantId: settings.merchantId.trim(),
      secretKey: settings.secretKey.trim(),
      callbackUrl: settings.callbackUrl.trim(),
      timeoutMs: settings.timeoutMs ?? 30_000,
      webhookSecret: settings.webhookSecret?.trim() || undefined,
    });
  }

  static fromEnvironment(overrides: Partial<FinikConnectionSettings> = {}): FinikConfiguration {
    const env = getServerEnv();
    const appUrl = env.APP_URL ?? "http://localhost:3000";

    return FinikConfiguration.create({
      baseUrl: overrides.baseUrl ?? process.env.FINIK_BASE_URL ?? "https://api.finik.kg",
      merchantId: overrides.merchantId ?? process.env.FINIK_MERCHANT_ID ?? "marketplace",
      secretKey: overrides.secretKey ?? env.FINIK_API_KEY ?? "",
      callbackUrl: overrides.callbackUrl ?? `${appUrl}/api/public/webhooks/finik`,
      timeoutMs: overrides.timeoutMs ?? 30_000,
      webhookSecret: overrides.webhookSecret ?? env.FINIK_WEBHOOK_SECRET,
    });
  }

  toConnectionSettings(): FinikConnectionSettings {
    return Object.freeze({
      baseUrl: this.baseUrl,
      merchantId: this.merchantId,
      secretKey: this.secretKey,
      callbackUrl: this.callbackUrl,
      timeoutMs: this.timeoutMs,
      webhookSecret: this.webhookSecret,
    });
  }
}
