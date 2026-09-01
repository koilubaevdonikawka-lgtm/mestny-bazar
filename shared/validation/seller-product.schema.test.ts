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

  it("accepts a fractional sortOrder as a decimal string (Задача №230/231 — insert between two products)", () => {
    const result = createSellerProductRequestSchema.parse({
      name: "Хлеб",
      price: 50,
      sortOrder: "1.1",
    });
    expect(result.sortOrder).toBe("1.1");
  });

  it("accepts an arbitrarily long decimal string without any precision loss (the whole point of it being a string, not a number)", () => {
    const long = "1.15555555555555555555555555555555555555";
    const result = createSellerProductRequestSchema.parse({
      name: "Хлеб",
      price: 50,
      sortOrder: long,
    });
    expect(result.sortOrder).toBe(long);
  });

  it("accepts a null sortOrder (not yet numbered)", () => {
    const result = createSellerProductRequestSchema.parse({
      name: "Хлеб",
      price: 50,
      sortOrder: null,
    });
    expect(result.sortOrder).toBeNull();
  });

  it("rejects a non-numeric sortOrder string", () => {
    expect(() =>
      createSellerProductRequestSchema.parse({ name: "Хлеб", price: 50, sortOrder: "abc" }),
    ).toThrow();
  });

  it("rejects a sortOrder sent as a JS number (must be a string — see contract comment on why)", () => {
    expect(() =>
      createSellerProductRequestSchema.parse({ name: "Хлеб", price: 50, sortOrder: 1.1 }),
    ).toThrow();
  });

  it("rejects scientific notation / non-plain-decimal formats", () => {
    expect(() =>
      createSellerProductRequestSchema.parse({ name: "Хлеб", price: 50, sortOrder: "1e10" }),
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
