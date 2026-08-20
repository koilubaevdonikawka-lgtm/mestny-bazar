import { describe, expect, it } from "vitest";
import {
  checkPaymentStatusRequestSchema,
  finikWebhookPayloadSchema,
} from "@shared/validation/payment.schema";

describe("finikWebhookPayloadSchema", () => {
  it("accepts a well-formed payload", () => {
    const result = finikWebhookPayloadSchema.safeParse({
      id: "provider-1",
      transactionId: "txn-1",
      status: "success",
      amount: 500,
      requestDate: "2026-08-20T10:00:00Z",
      transactionDate: "2026-08-20T10:00:05Z",
      fields: { paymentId: "idem-1", amount: 500 },
    });

    expect(result.success).toBe(true);
  });

  it("accepts a payload without the optional transactionId/service (falls back to id)", () => {
    const result = finikWebhookPayloadSchema.safeParse({
      id: "provider-1",
      status: "success",
      fields: { paymentId: "idem-1" },
    });

    expect(result.success).toBe(true);
  });

  it.each([
    { id: "", status: "success", fields: { paymentId: "idem-1" } },
    { id: "provider-1", status: "", fields: { paymentId: "idem-1" } },
    { id: "provider-1", status: "success", fields: { paymentId: "" } },
    { id: "provider-1", status: "success" },
    { status: "success", fields: { paymentId: "idem-1" } },
  ])("rejects a malformed payload %#", (payload) => {
    expect(finikWebhookPayloadSchema.safeParse(payload).success).toBe(false);
  });
});

describe("checkPaymentStatusRequestSchema", () => {
  it("accepts a valid UUID orderId", () => {
    expect(
      checkPaymentStatusRequestSchema.safeParse({ orderId: "123e4567-e89b-12d3-a456-426614174000" })
        .success,
    ).toBe(true);
  });

  it("rejects a non-UUID orderId", () => {
    expect(checkPaymentStatusRequestSchema.safeParse({ orderId: "not-a-uuid" }).success).toBe(
      false,
    );
  });
});
