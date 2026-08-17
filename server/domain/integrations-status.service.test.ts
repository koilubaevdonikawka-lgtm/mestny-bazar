import { describe, expect, it } from "vitest";
import { IntegrationsStatusService } from "@server/domain/integrations-status.service";

describe("IntegrationsStatusService.getStatus", () => {
  it("marks Finik as configured when the secret is present", () => {
    const service = new IntegrationsStatusService({
      finikApiKeyConfigured: true,
      telegramBotTokenConfigured: false,
      whatsappApiTokenConfigured: false,
    });

    const finik = service.getStatus().integrations.find((i) => i.adapter === "FinikPaymentAdapter");
    expect(finik?.secretConfigured).toBe(true);
    expect(finik?.status).toBe("STUB");
  });

  it("marks Telegram as NOT_CONFIGURED when the bot token is absent", () => {
    const service = new IntegrationsStatusService({
      finikApiKeyConfigured: false,
      telegramBotTokenConfigured: false,
      whatsappApiTokenConfigured: false,
    });

    const telegram = service
      .getStatus()
      .integrations.find((i) => i.adapter === "TelegramNotificationAdapter");
    expect(telegram?.status).toBe("NOT_CONFIGURED");
    expect(telegram?.secretConfigured).toBe(false);
  });

  it("never exposes a secretConfigured flag for integrations with no secret (storage)", () => {
    const service = new IntegrationsStatusService({
      finikApiKeyConfigured: false,
      telegramBotTokenConfigured: false,
      whatsappApiTokenConfigured: false,
    });

    const storage = service.getStatus().integrations.find((i) => i.name.includes("Хранилище"));
    expect(storage?.secretConfigured).toBeNull();
  });
});
