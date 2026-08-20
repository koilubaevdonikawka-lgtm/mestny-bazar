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
const REQUEST_META = {
  httpMethod: "POST",
  path: "/api/webhooks/finik",
  host: "mesnyibazar.com",
  headers: { "x-api-timestamp": TIMESTAMP },
  queryStringParameters: null,
};

describe("handlePaymentWebhook", () => {
  it("returns 400 for a malformed (non-JSON) body without ever calling PaymentService", async () => {
    const paymentService = fakePaymentService();

    const result = await handlePaymentWebhook("not json", "sig", REQUEST_META, paymentService);

    expect(result.status).toBe(400);
    expect(paymentService.handleWebhook).not.toHaveBeenCalled();
  });

  it("returns 400 when fields.paymentId is missing from an otherwise-valid JSON body", async () => {
    const paymentService = fakePaymentService();

    const result = await handlePaymentWebhook(
      JSON.stringify({ id: "txn-1", status: "success" }),
      "sig",
      REQUEST_META,
      paymentService,
    );

    expect(result.status).toBe(400);
    expect(paymentService.handleWebhook).not.toHaveBeenCalled();
  });

  it("parses a valid payload with no top-level order_id, extracts fields.paymentId, and calls PaymentService.handleWebhook", async () => {
    const paymentService = fakePaymentService();
    const rawBody = JSON.stringify({
      id: "txn-1",
      transactionId: "txn-1",
      status: "success",
      fields: { paymentId: "idem-1" },
    });

    const result = await handlePaymentWebhook(rawBody, "sig", REQUEST_META, paymentService);

    expect(paymentService.handleWebhook).toHaveBeenCalledWith(
      {
        rawBody,
        signature: "sig",
        httpMethod: "POST",
        path: "/api/webhooks/finik",
        host: "mesnyibazar.com",
        headers: { "x-api-timestamp": TIMESTAMP },
        queryStringParameters: null,
      },
      {
        providerPaymentId: "idem-1",
        transactionId: "txn-1",
        status: "paid",
      },
    );
    expect(result.status).toBe(200);
  });

  it("falls back to `id` for transactionId when Finik omits it", async () => {
    const paymentService = fakePaymentService();
    const rawBody = JSON.stringify({
      id: "txn-fallback",
      status: "success",
      fields: { paymentId: "idem-1" },
    });

    await handlePaymentWebhook(rawBody, "sig", REQUEST_META, paymentService);

    expect(paymentService.handleWebhook).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ transactionId: "txn-fallback" }),
    );
  });

  it.each(["success", "SUCCESS", "succeeded", "Succeeded"])(
    "maps status %s to paid, case-insensitively",
    async (rawStatus) => {
      const paymentService = fakePaymentService();
      const rawBody = JSON.stringify({
        id: "txn-1",
        status: rawStatus,
        fields: { paymentId: "idem-1" },
      });

      await handlePaymentWebhook(rawBody, "sig", REQUEST_META, paymentService);

      expect(paymentService.handleWebhook).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ status: "paid" }),
      );
    },
  );

  it("maps an unrecognized raw status to failed, defensively (Finik's webhook only documents success deliveries)", async () => {
    const paymentService = fakePaymentService();
    const rawBody = JSON.stringify({
      id: "txn-1",
      status: "pending",
      fields: { paymentId: "idem-1" },
    });

    await handlePaymentWebhook(rawBody, "sig", REQUEST_META, paymentService);

    expect(paymentService.handleWebhook).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ status: "failed" }),
    );
  });

  it("returns 401 when PaymentService rejects due to an invalid signature", async () => {
    const paymentService = fakePaymentService({
      handleWebhook: vi.fn(async () => ({ accepted: false, reason: "invalid_signature" as const })),
    });
    const rawBody = JSON.stringify({
      id: "txn-1",
      status: "success",
      fields: { paymentId: "idem-1" },
    });

    const result = await handlePaymentWebhook(rawBody, "bad-sig", REQUEST_META, paymentService);

    expect(result.status).toBe(401);
  });

  it("returns 400 when PaymentService rejects due to an unknown payment", async () => {
    const paymentService = fakePaymentService({
      handleWebhook: vi.fn(async () => ({ accepted: false, reason: "unknown_order" as const })),
    });
    const rawBody = JSON.stringify({
      id: "txn-1",
      status: "success",
      fields: { paymentId: "ghost" },
    });

    const result = await handlePaymentWebhook(rawBody, "sig", REQUEST_META, paymentService);

    expect(result.status).toBe(400);
  });
});
