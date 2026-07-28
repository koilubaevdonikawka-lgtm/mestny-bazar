import { describe, expect, it } from "vitest";
import { isUuid } from "@server/domain/shared/uuid";

describe("isUuid", () => {
  it("accepts a well-formed lowercase UUID", () => {
    expect(isUuid("123e4567-e89b-12d3-a456-426614174000")).toBe(true);
  });

  it("accepts a well-formed uppercase UUID (case-insensitive)", () => {
    expect(isUuid("123E4567-E89B-12D3-A456-426614174000")).toBe(true);
  });

  it("rejects a product slug", () => {
    expect(isUuid("fresh-apples")).toBe(false);
  });

  it("rejects a UUID missing dashes", () => {
    expect(isUuid("123e4567e89b12d3a456426614174000")).toBe(false);
  });

  it("rejects a UUID with a segment of the wrong length", () => {
    expect(isUuid("123e456-e89b-12d3-a456-426614174000")).toBe(false);
  });

  it("rejects a UUID containing non-hex characters", () => {
    expect(isUuid("123e4567-e89b-12d3-a456-42661417400g")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isUuid("")).toBe(false);
  });

  it("rejects a UUID with surrounding whitespace", () => {
    expect(isUuid(" 123e4567-e89b-12d3-a456-426614174000 ")).toBe(false);
  });

  it("rejects a UUID with trailing garbage", () => {
    expect(isUuid("123e4567-e89b-12d3-a456-426614174000-extra")).toBe(false);
  });
});
