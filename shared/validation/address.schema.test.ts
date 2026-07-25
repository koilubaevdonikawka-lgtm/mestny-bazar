import { describe, expect, it } from "vitest";
import { createAddressRequestSchema, updateAddressRequestSchema } from "./address.schema";

describe("createAddressRequestSchema", () => {
  it("accepts a minimal valid payload", () => {
    const result = createAddressRequestSchema.parse({ fullAddress: "г. Бишкек, ул. Абая 10" });
    expect(result.fullAddress).toBe("г. Бишкек, ул. Абая 10");
  });

  it("rejects a missing fullAddress", () => {
    expect(() => createAddressRequestSchema.parse({})).toThrow();
  });

  it("rejects an empty fullAddress", () => {
    expect(() => createAddressRequestSchema.parse({ fullAddress: "" })).toThrow();
  });

  it("rejects fullAddress longer than 500 characters", () => {
    expect(() => createAddressRequestSchema.parse({ fullAddress: "a".repeat(501) })).toThrow();
  });

  it("rejects a non-uuid zoneId", () => {
    expect(() =>
      createAddressRequestSchema.parse({ fullAddress: "valid address", zoneId: "not-a-uuid" }),
    ).toThrow();
  });

  it("rejects a non-string notes field (type confusion)", () => {
    expect(() =>
      createAddressRequestSchema.parse({ fullAddress: "valid address", notes: 12345 }),
    ).toThrow();
  });

  it("trims whitespace from string fields", () => {
    const result = createAddressRequestSchema.parse({ fullAddress: "  valid address  " });
    expect(result.fullAddress).toBe("valid address");
  });
});

describe("updateAddressRequestSchema", () => {
  const VALID_ID = "11111111-1111-1111-1111-111111111111";

  it("requires a uuid id", () => {
    expect(() => updateAddressRequestSchema.parse({ id: "not-a-uuid" })).toThrow();
  });

  it("accepts an id with no other fields (partial update)", () => {
    const result = updateAddressRequestSchema.parse({ id: VALID_ID });
    expect(result.id).toBe(VALID_ID);
  });

  it("accepts isDefault alongside id", () => {
    const result = updateAddressRequestSchema.parse({ id: VALID_ID, isDefault: true });
    expect(result.isDefault).toBe(true);
  });
});
