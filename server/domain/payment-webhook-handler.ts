import { finikWebhookPayloadSchema } from "@shared/validation/payment.schema";
import type { PaymentService } from "@server/domain/payment.service";
import { logger } from "@shared/observability/logger";

export interface WebhookHandlerResult {
  status: number;
  body: string;
}

/**
 * Maps Finik's raw status vocabulary to the binary "paid"/"failed" the
 * webhook payload interface expects (Промпт №075). Confirm the real status
 * strings against Finik's docs — see finik.adapter.ts's own note.
 */
function mapFinikWebhookStatus(rawStatus: string): "paid" | "failed" {
  return rawStatus === "paid" || rawStatus === "succeeded" ? "paid" : "failed";
}

/**
 * Pure, HTTP-shape-agnostic webhook handler — all real logic lives here so
 * it stays unit-testable without touching src/server.ts or a real request.
 * Parses the raw body structurally first (never trusts field values before
 * PaymentService verifies the signature over the exact raw bytes).
 */
export async function handlePaymentWebhook(
  rawBody: string,
  signatureHeader: string | null,
  timestampHeader: string | null,
  paymentService: PaymentService,
): Promise<WebhookHandlerResult> {
  let parsed;
  try {
    parsed = finikWebhookPayloadSchema.parse(JSON.parse(rawBody));
  } catch (error) {
    logger.warn("payment:webhook-malformed-body", { error });
    return { status: 400, body: JSON.stringify({ error: "invalid_payload" }) };
  }

  const result = await paymentService.handleWebhook(rawBody, signatureHeader, timestampHeader, {
    providerPaymentId: parsed.id,
    orderId: parsed.order_id,
    status: mapFinikWebhookStatus(parsed.status),
  });

  if (!result.accepted) {
    const status = result.reason === "invalid_signature" ? 401 : 400;
    return { status, body: JSON.stringify({ error: result.reason ?? "rejected" }) };
  }

  return { status: 200, body: JSON.stringify({ ok: true }) };
}
