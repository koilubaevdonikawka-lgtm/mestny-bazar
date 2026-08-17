import { describe, expect, it } from "vitest";
import { productListParamsSchema, productSlugParamSchema } from "./catalog.schema";

describe("productListParamsSchema", () => {
  it("accepts undefined", () => {
    expect(productListParamsSchema.parse(undefined)).toBeUndefined();
  });

  it("accepts an empty object", () => {
    expect(productListParamsSchema.parse({})).toEqual({});
  });

  it("accepts a full valid set of params", () => {
    const result = productListParamsSchema.parse({
      search: "хлеб",
      page: 2,
      pageSize: 24,
      inStockOnly: true,
    });
    expect(result).toMatchObject({ search: "хлеб", page: 2, pageSize: 24, inStockOnly: true });
  });

  it("rejects a pageSize above 200", () => {
    expect(() => productListParamsSchema.parse({ pageSize: 1000 })).toThrow();
  });

  it("rejects a non-boolean inStockOnly (type confusion)", () => {
    expect(() => productListParamsSchema.parse({ inStockOnly: "true" })).toThrow();
  });
});

describe("productSlugParamSchema", () => {
  it("accepts a valid slug", () => {
    expect(productSlugParamSchema.parse({ slug: "fresh-bread" }).slug).toBe("fresh-bread");
  });

  it("rejects an empty slug", () => {
    expect(() => productSlugParamSchema.parse({ slug: "" })).toThrow();
  });

  it("rejects a missing slug", () => {
    expect(() => productSlugParamSchema.parse({})).toThrow();
  });
});
