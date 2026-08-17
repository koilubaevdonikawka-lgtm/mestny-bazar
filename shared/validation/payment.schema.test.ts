import { describe, expect, it } from "vitest";
import {
  checkPaymentStatusRequestSchema,
  finikWebhookPayloadSchema,
} from "@shared/validation/payment.schema";

describe("finikWebhookPayloadSchema", () => {
  it("accepts a well-formed payload", () => {
    const result = finikWebhookPayloadSchema.safeParse({
      id: "provider-1",
      order_id: "order-1",
      status: "paid",
    });

    expect(result.success).toBe(true);
  });

  it.each([
    { id: "", order_id: "order-1", status: "paid" },
    { id: "provider-1", order_id: "", status: "paid" },
    { id: "provider-1", order_id: "order-1", status: "" },
    { order_id: "order-1", status: "paid" },
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
