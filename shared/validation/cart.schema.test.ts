import { describe, expect, it } from "vitest";
import {
  addCartItemRequestSchema,
  mergeGuestCartRequestSchema,
  removeCartItemRequestSchema,
  updateCartItemRequestSchema,
  validateCartRequestSchema,
} from "@shared/validation/cart.schema";

const snapshot = { name: "Молоко", price: 100, currency: "KGS", imageUrl: null };

describe("cartLineInputSchema (via addCartItemRequestSchema)", () => {
  it("accepts a line identified by productId", () => {
    expect(
      addCartItemRequestSchema.safeParse({ productId: "prod-1", quantity: 1, snapshot }).success,
    ).toBe(true);
  });

  it("accepts a line identified by productSlug", () => {
    expect(
      addCartItemRequestSchema.safeParse({ productSlug: "moloko", quantity: 1, snapshot }).success,
    ).toBe(true);
  });

  it("rejects a line with neither productId nor productSlug", () => {
    expect(addCartItemRequestSchema.safeParse({ quantity: 1, snapshot }).success).toBe(false);
  });

  it("rejects a non-positive quantity", () => {
    expect(
      addCartItemRequestSchema.safeParse({ productId: "prod-1", quantity: 0, snapshot }).success,
    ).toBe(false);
  });

  it("rejects a quantity above the cap", () => {
    expect(
      addCartItemRequestSchema.safeParse({ productId: "prod-1", quantity: 1000, snapshot }).success,
    ).toBe(false);
  });

  it("rejects a negative snapshot price", () => {
    expect(
      addCartItemRequestSchema.safeParse({
        productId: "prod-1",
        quantity: 1,
        snapshot: { ...snapshot, price: -1 },
      }).success,
    ).toBe(false);
  });
});

describe("updateCartItemRequestSchema", () => {
  it("allows quantity 0 (means remove)", () => {
    expect(
      updateCartItemRequestSchema.safeParse({ productId: "prod-1", quantity: 0 }).success,
    ).toBe(true);
  });

  it("rejects a negative quantity", () => {
    expect(
      updateCartItemRequestSchema.safeParse({ productId: "prod-1", quantity: -1 }).success,
    ).toBe(false);
  });

  it("rejects a request with no identifier", () => {
    expect(updateCartItemRequestSchema.safeParse({ quantity: 1 }).success).toBe(false);
  });
});

describe("removeCartItemRequestSchema", () => {
  it("accepts an identifier by slug", () => {
    expect(removeCartItemRequestSchema.safeParse({ productSlug: "moloko" }).success).toBe(true);
  });

  it("rejects an empty identifier", () => {
    expect(removeCartItemRequestSchema.safeParse({}).success).toBe(false);
  });
});

describe("validateCartRequestSchema", () => {
  it("accepts a batch of lines", () => {
    expect(
      validateCartRequestSchema.safeParse({
        lines: [
          { productId: "prod-1", quantity: 1, snapshot },
          { productSlug: "moloko", quantity: 2, snapshot },
        ],
      }).success,
    ).toBe(true);
  });

  it("rejects a batch over the cap", () => {
    const lines = Array.from({ length: 201 }, (_, i) => ({
      productId: `prod-${i}`,
      quantity: 1,
      snapshot,
    }));
    expect(validateCartRequestSchema.safeParse({ lines }).success).toBe(false);
  });
});

describe("mergeGuestCartRequestSchema", () => {
  it("accepts an empty lines array (nothing to merge)", () => {
    expect(mergeGuestCartRequestSchema.safeParse({ lines: [] }).success).toBe(true);
  });
});
