import { describe, expect, it } from "vitest";
import { createCategoryRequestSchema, updateCategoryRequestSchema } from "./category-admin.schema";

describe("createCategoryRequestSchema", () => {
  it("accepts a minimal valid payload", () => {
    const result = createCategoryRequestSchema.parse({ name: "Молочные продукты" });
    expect(result).toMatchObject({ name: "Молочные продукты" });
  });

  it("rejects a missing name", () => {
    expect(() => createCategoryRequestSchema.parse({})).toThrow();
  });

  it("accepts a fractional sortOrder as a decimal string (Задача №232 — insert between two subcategories)", () => {
    const result = createCategoryRequestSchema.parse({ name: "Dairy", sortOrder: "1.1" });
    expect(result.sortOrder).toBe("1.1");
  });

  it("accepts an arbitrarily long decimal string without any precision loss", () => {
    const long = "1.15555555555555555555555555555555555555";
    const result = createCategoryRequestSchema.parse({ name: "Dairy", sortOrder: long });
    expect(result.sortOrder).toBe(long);
  });

  it("rejects a non-numeric sortOrder string", () => {
    expect(() => createCategoryRequestSchema.parse({ name: "Dairy", sortOrder: "abc" })).toThrow();
  });

  it("rejects a sortOrder sent as a JS number (must be a string)", () => {
    expect(() => createCategoryRequestSchema.parse({ name: "Dairy", sortOrder: 1.1 })).toThrow();
  });

  it("rejects scientific notation / non-plain-decimal formats", () => {
    expect(() => createCategoryRequestSchema.parse({ name: "Dairy", sortOrder: "1e10" })).toThrow();
  });

  it("accepts an explicit null parentId (top-level category)", () => {
    const result = createCategoryRequestSchema.parse({ name: "Dairy", parentId: null });
    expect(result.parentId).toBeNull();
  });

  it("accepts a uuid parentId (subcategory)", () => {
    const parentId = "11111111-1111-1111-1111-111111111111";
    const result = createCategoryRequestSchema.parse({ name: "Dairy", parentId });
    expect(result.parentId).toBe(parentId);
  });
});

describe("updateCategoryRequestSchema", () => {
  const VALID_ID = "11111111-1111-1111-1111-111111111111";

  it("requires a uuid id", () => {
    expect(() => updateCategoryRequestSchema.parse({ id: "not-a-uuid" })).toThrow();
  });

  it("accepts an id with a partial sortOrder update", () => {
    const result = updateCategoryRequestSchema.parse({ id: VALID_ID, sortOrder: "2.5" });
    expect(result).toMatchObject({ id: VALID_ID, sortOrder: "2.5" });
  });
});
