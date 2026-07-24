import type { TelegramConnectionSettings } from "@server/infrastructure/configuration";
import { getServerEnv } from "@server/config/env";
import type { NotificationParseMode } from "@server/infrastructure/notifications";

/** Resolved Telegram connection settings for infrastructure adapters. */
export class TelegramConfiguration {
  readonly botToken: string;
  readonly apiUrl: string;
  readonly defaultParseMode: NotificationParseMode;
  readonly timeoutMs: number;

  private constructor(settings: TelegramConnectionSettings) {
    this.botToken = settings.botToken;
    this.apiUrl = settings.apiUrl.replace(/\/+$/, "");
    this.defaultParseMode = settings.defaultParseMode;
    this.timeoutMs = settings.timeoutMs;
    Object.freeze(this);
  }

  static create(settings: TelegramConnectionSettings): TelegramConfiguration {
    if (!settings.botToken?.trim()) {
      throw new Error("TelegramConfiguration requires botToken.");
    }
    if (!settings.apiUrl?.trim()) {
      throw new Error("TelegramConfiguration requires apiUrl.");
    }

    return new TelegramConfiguration({
      botToken: settings.botToken.trim(),
      apiUrl: settings.apiUrl.trim(),
      defaultParseMode: settings.defaultParseMode ?? "HTML",
      timeoutMs: settings.timeoutMs ?? 30_000,
    });
  }

  static fromEnvironment(
    overrides: Partial<TelegramConnectionSettings> = {},
  ): TelegramConfiguration {
    const env = getServerEnv();

    return TelegramConfiguration.create({
      botToken: overrides.botToken ?? env.TELEGRAM_BOT_TOKEN ?? "",
      apiUrl: overrides.apiUrl ?? process.env.TELEGRAM_API_URL ?? "https://api.telegram.org",
      defaultParseMode: overrides.defaultParseMode ?? "HTML",
      timeoutMs: overrides.timeoutMs ?? 30_000,
    });
  }

  toConnectionSettings(): TelegramConnectionSettings {
    return Object.freeze({
      botToken: this.botToken,
      apiUrl: this.apiUrl,
      defaultParseMode: this.defaultParseMode,
      timeoutMs: this.timeoutMs,
    });
  }

  botApiUrl(methodName: string): string {
    return `${this.apiUrl}/bot${this.botToken}/${methodName}`;
  }
}
