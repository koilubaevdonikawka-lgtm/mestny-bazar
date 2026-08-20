import { finikWebhookPayloadSchema } from "@shared/validation/payment.schema";
import type { PaymentService } from "@server/domain/payment.service";
import { logger } from "@shared/observability/logger";

export interface WebhookHandlerResult {
  status: number;
  body: string;
}

/** Everything about the raw incoming HTTP request `IPaymentProvider.verifyWebhook()` needs to rebuild Finik's canonical string — built by `src/server.ts` from the real `Request`. */
export interface FinikWebhookRequestMeta {
  httpMethod: string;
  path: string;
  host: string;
  /** Only the `x-api-*` subset — the signing library itself filters to that prefix. */
  headers: Record<string, string>;
  queryStringParameters: Record<string, string> | null;
}

/**
 * Finik's webhook fires only on a successful payment (Промпт №080) — there
 * is no "payment failed" delivery at all; an abandoned/declined attempt is
 * inferred from the webhook never arriving (PaymentService.checkExpiry's
 * existing 30-minute sweep, untouched by this change). `status` is still
 * present on every payload Finik does send, so this stays a defensive
 * classifier rather than an unconditional "paid": anything other than the
 * two documented success spellings is treated as not-yet-confirmed rather
 * than trusted blindly.
 */
function mapFinikWebhookStatus(rawStatus: string): "paid" | "failed" {
  const normalized = rawStatus.trim().toLowerCase();
  return normalized === "success" || normalized === "succeeded" ? "paid" : "failed";
}

/**
 * Pure, HTTP-shape-agnostic webhook handler — all real logic lives here so
 * it stays unit-testable without touching src/server.ts or a real request.
 * Parses the raw body structurally first (never trusts field values before
 * PaymentService verifies the signature over the exact raw bytes). There is
 * no `order_id` in Finik's real payload — the local payment is identified by
 * `fields.paymentId` (Промпт №080).
 */
export async function handlePaymentWebhook(
  rawBody: string,
  signatureHeader: string | null,
  requestMeta: FinikWebhookRequestMeta,
  paymentService: PaymentService,
): Promise<WebhookHandlerResult> {
  let parsed;
  try {
    parsed = finikWebhookPayloadSchema.parse(JSON.parse(rawBody));
  } catch (error) {
    logger.warn("payment:webhook-malformed-body", { error });
    return { status: 400, body: JSON.stringify({ error: "invalid_payload" }) };
  }

  const result = await paymentService.handleWebhook(
    {
      rawBody,
      signature: signatureHeader,
      httpMethod: requestMeta.httpMethod,
      path: requestMeta.path,
      host: requestMeta.host,
      headers: requestMeta.headers,
      queryStringParameters: requestMeta.queryStringParameters,
    },
    {
      providerPaymentId: parsed.fields.paymentId,
      transactionId: parsed.transactionId ?? parsed.id,
      status: mapFinikWebhookStatus(parsed.status),
    },
  );

  if (!result.accepted) {
    const status = result.reason === "invalid_signature" ? 401 : 400;
    return { status, body: JSON.stringify({ error: result.reason ?? "rejected" }) };
  }

  return { status: 200, body: JSON.stringify({ ok: true }) };
}
