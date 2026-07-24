import { createHmac, timingSafeEqual } from "node:crypto";
import type { FinikConfiguration } from "@server/infrastructure/finik/configuration";
import { FinikWebhookVerificationError } from "@server/infrastructure/finik/shared";

/** Verifies Finik webhook signatures using the configured secret. */
export class FinikWebhookVerifier {
  constructor(private readonly configuration: FinikConfiguration) {
    Object.freeze(this);
  }

  verify(rawBody: string, signatureHeader: string | null): boolean {
    const secret = this.configuration.webhookSecret;
    if (!secret) {
      return false;
    }

    if (!signatureHeader?.trim()) {
      throw new FinikWebhookVerificationError("Missing Finik webhook signature header.");
    }

    const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
    const provided = signatureHeader.trim().replace(/^sha256=/i, "");

    try {
      return timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(provided, "utf8"));
    } catch {
      return false;
    }
  }
}
