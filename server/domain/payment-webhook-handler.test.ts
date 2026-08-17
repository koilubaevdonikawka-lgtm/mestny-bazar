import { describe, expect, it, vi } from "vitest";
import { handlePaymentWebhook } from "@server/domain/payment-webhook-handler";
import type { PaymentService } from "@server/domain/payment.service";

function fakePaymentService(overrides: Partial<PaymentService> = {}): PaymentService {
  return {
    handleWebhook: vi.fn(async () => ({ accepted: true })),
    ...overrides,
  } as unknown as PaymentService;
}

const TIMESTAMP = "1700000000";

describe("handlePaymentWebhook", () => {
  it("returns 400 for a malformed (non-JSON) body without ever calling PaymentService", async () => {
    const paymentService = fakePaymentService();

    const result = await handlePaymentWebhook("not json", "sig", TIMESTAMP, paymentService);

    expect(result.status).toBe(400);
    expect(paymentService.handleWebhook).not.toHaveBeenCalled();
  });

  it("returns 400 when required fields are missing from an otherwise-valid JSON body", async () => {
    const paymentService = fakePaymentService();

    const result = await handlePaymentWebhook(
      JSON.stringify({ id: "p1" }),
      "sig",
      TIMESTAMP,
      paymentService,
    );

    expect(result.status).toBe(400);
    expect(paymentService.handleWebhook).not.toHaveBeenCalled();
  });

  it("parses a valid payload, maps status, and calls PaymentService.handleWebhook with the timestamp", async () => {
    const paymentService = fakePaymentService();
    const rawBody = JSON.stringify({ id: "provider-1", order_id: "order-1", status: "paid" });

    const result = await handlePaymentWebhook(rawBody, "sig", TIMESTAMP, paymentService);

    expect(paymentService.handleWebhook).toHaveBeenCalledWith(rawBody, "sig", TIMESTAMP, {
      providerPaymentId: "provider-1",
      orderId: "order-1",
      status: "paid",
    });
    expect(result.status).toBe(200);
  });

  it("maps an unrecognized raw status to failed", async () => {
    const paymentService = fakePaymentService();
    const rawBody = JSON.stringify({ id: "provider-1", order_id: "order-1", status: "cancelled" });

    await handlePaymentWebhook(rawBody, "sig", TIMESTAMP, paymentService);

    expect(paymentService.handleWebhook).toHaveBeenCalledWith(
      rawBody,
      "sig",
      TIMESTAMP,
      expect.objectContaining({ status: "failed" }),
    );
  });

  it("returns 401 when PaymentService rejects due to an invalid signature", async () => {
    const paymentService = fakePaymentService({
      handleWebhook: vi.fn(async () => ({ accepted: false, reason: "invalid_signature" as const })),
    });
    const rawBody = JSON.stringify({ id: "provider-1", order_id: "order-1", status: "paid" });

    const result = await handlePaymentWebhook(rawBody, "bad-sig", TIMESTAMP, paymentService);

    expect(result.status).toBe(401);
  });

  it("returns 400 when PaymentService rejects due to an unknown order", async () => {
    const paymentService = fakePaymentService({
      handleWebhook: vi.fn(async () => ({ accepted: false, reason: "unknown_order" as const })),
    });
    const rawBody = JSON.stringify({ id: "provider-1", order_id: "ghost", status: "paid" });

    const result = await handlePaymentWebhook(rawBody, "sig", TIMESTAMP, paymentService);

    expect(result.status).toBe(400);
  });
});
