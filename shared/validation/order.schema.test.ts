import { describe, expect, it } from "vitest";
import { createOrderRequestSchema, orderListParamsSchema } from "./order.schema";

function baseOrder(overrides: Record<string, unknown> = {}) {
  return {
    items: [{ productId: "11111111-1111-1111-1111-111111111111", quantity: 2 }],
    customerName: "Buyer",
    customerPhone: "996700000000",
    paymentMethod: "CASH",
    idempotencyKey: "idem-key-1",
    ...overrides,
  };
}

describe("createOrderRequestSchema", () => {
  it("accepts a valid minimal order", () => {
    const result = createOrderRequestSchema.parse(baseOrder());
    expect(result.items).toHaveLength(1);
  });

  it("rejects an empty items array — this is exactly the cart-size DoS gap being closed", () => {
    expect(() => createOrderRequestSchema.parse(baseOrder({ items: [] }))).toThrow();
  });

  it("rejects an items array larger than 100 — the unbounded-cart-size finding", () => {
    const items = Array.from({ length: 101 }, () => ({
      productId: "11111111-1111-1111-1111-111111111111",
      quantity: 1,
    }));
    expect(() => createOrderRequestSchema.parse(baseOrder({ items }))).toThrow();
  });

  it("accepts exactly 100 items", () => {
    const items = Array.from({ length: 100 }, () => ({
      productId: "11111111-1111-1111-1111-111111111111",
      quantity: 1,
    }));
    const result = createOrderRequestSchema.parse(baseOrder({ items }));
    expect(result.items).toHaveLength(100);
  });

  it("rejects a non-positive quantity", () => {
    expect(() =>
      createOrderRequestSchema.parse(
        baseOrder({ items: [{ productId: "11111111-1111-1111-1111-111111111111", quantity: 0 }] }),
      ),
    ).toThrow();
  });

  it("rejects a quantity above 999", () => {
    expect(() =>
      createOrderRequestSchema.parse(
        baseOrder({
          items: [{ productId: "11111111-1111-1111-1111-111111111111", quantity: 1000 }],
        }),
      ),
    ).toThrow();
  });

  it("rejects an invalid paymentMethod enum value", () => {
    expect(() => createOrderRequestSchema.parse(baseOrder({ paymentMethod: "BITCOIN" }))).toThrow();
  });

  it("rejects a missing idempotencyKey", () => {
    const { idempotencyKey: _omit, ...rest } = baseOrder();
    expect(() => createOrderRequestSchema.parse(rest)).toThrow();
  });

  it("rejects a numeric customerPhone (type confusion)", () => {
    expect(() =>
      createOrderRequestSchema.parse(baseOrder({ customerPhone: 996700000000 })),
    ).toThrow();
  });
});

describe("orderListParamsSchema", () => {
  it("accepts undefined", () => {
    expect(orderListParamsSchema.parse(undefined)).toBeUndefined();
  });

  it("accepts an empty object", () => {
    expect(orderListParamsSchema.parse({})).toEqual({});
  });

  it("rejects a pageSize above 200", () => {
    expect(() => orderListParamsSchema.parse({ pageSize: 500 })).toThrow();
  });

  it("rejects a negative page", () => {
    expect(() => orderListParamsSchema.parse({ page: -1 })).toThrow();
  });
});
