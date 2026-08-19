import { describe, expect, it } from "vitest";
import {
  createSellerProductRequestSchema,
  updateSellerProductRequestSchema,
} from "./seller-product.schema";

describe("createSellerProductRequestSchema", () => {
  it("accepts a minimal valid payload", () => {
    const result = createSellerProductRequestSchema.parse({ name: "Хлеб", price: 50 });
    expect(result).toMatchObject({ name: "Хлеб", price: 50 });
  });

  it("rejects a missing name", () => {
    expect(() => createSellerProductRequestSchema.parse({ price: 50 })).toThrow();
  });

  it("rejects a negative price", () => {
    expect(() => createSellerProductRequestSchema.parse({ name: "Хлеб", price: -1 })).toThrow();
  });

  it("rejects a price above the sanity ceiling", () => {
    expect(() =>
      createSellerProductRequestSchema.parse({ name: "Хлеб", price: 50_000_000 }),
    ).toThrow();
  });

  it("rejects a non-finite price (type confusion via Infinity)", () => {
    expect(() =>
      createSellerProductRequestSchema.parse({ name: "Хлеб", price: Infinity }),
    ).toThrow();
  });

  it("rejects a negative stock", () => {
    expect(() =>
      createSellerProductRequestSchema.parse({ name: "Хлеб", price: 50, stock: -5 }),
    ).toThrow();
  });

  it("rejects a non-integer stock", () => {
    expect(() =>
      createSellerProductRequestSchema.parse({ name: "Хлеб", price: 50, stock: 1.5 }),
    ).toThrow();
  });

  it("rejects a non-uuid categoryId", () => {
    expect(() =>
      createSellerProductRequestSchema.parse({ name: "Хлеб", price: 50, categoryId: "abc" }),
    ).toThrow();
  });

  it("accepts a null weightKg (nullable — existing products without a set weight)", () => {
    const result = createSellerProductRequestSchema.parse({
      name: "Хлеб",
      price: 50,
      weightKg: null,
    });
    expect(result.weightKg).toBeNull();
  });

  it("accepts a valid non-negative weightKg", () => {
    const result = createSellerProductRequestSchema.parse({
      name: "Хлеб",
      price: 50,
      weightKg: 0.5,
    });
    expect(result.weightKg).toBe(0.5);
  });

  it("rejects a negative weightKg", () => {
    expect(() =>
      createSellerProductRequestSchema.parse({ name: "Хлеб", price: 50, weightKg: -1 }),
    ).toThrow();
  });
});

describe("updateSellerProductRequestSchema", () => {
  const VALID_ID = "11111111-1111-1111-1111-111111111111";

  it("requires a uuid id", () => {
    expect(() => updateSellerProductRequestSchema.parse({ id: "not-a-uuid" })).toThrow();
  });

  it("accepts an id with a partial field update", () => {
    const result = updateSellerProductRequestSchema.parse({ id: VALID_ID, price: 75 });
    expect(result).toMatchObject({ id: VALID_ID, price: 75 });
  });
});
