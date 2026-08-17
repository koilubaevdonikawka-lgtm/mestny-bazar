import { describe, expect, it } from "vitest";
import { listAdminProductsParamsSchema } from "./product-admin.schema";

describe("listAdminProductsParamsSchema", () => {
  it("accepts undefined", () => {
    expect(listAdminProductsParamsSchema.parse(undefined)).toBeUndefined();
  });

  it("accepts an empty object", () => {
    expect(listAdminProductsParamsSchema.parse({})).toEqual({});
  });

  it("accepts a normal pageSize", () => {
    expect(listAdminProductsParamsSchema.parse({ page: 1, pageSize: 24 })).toEqual({
      page: 1,
      pageSize: 24,
    });
  });

  it("accepts pageSize at the shared limit (200)", () => {
    expect(listAdminProductsParamsSchema.parse({ pageSize: 200 })).toEqual({ pageSize: 200 });
  });

  it("rejects pageSize above the shared limit — the exact value (500) that broke Склад in production", () => {
    expect(() => listAdminProductsParamsSchema.parse({ pageSize: 500 })).toThrow();
  });
});
