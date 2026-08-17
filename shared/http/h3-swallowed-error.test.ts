import { describe, expect, it } from "vitest";
import { isH3SwallowedErrorBody } from "./h3-swallowed-error";

describe("isH3SwallowedErrorBody", () => {
  it("recognizes h3's exact swallowed-error shape", () => {
    expect(isH3SwallowedErrorBody('{"unhandled":true,"message":"HTTPError"}')).toBe(true);
  });

  it("recognizes it with extra fields present", () => {
    expect(isH3SwallowedErrorBody('{"unhandled":true,"message":"HTTPError","stack":"..."}')).toBe(
      true,
    );
  });

  it("rejects a normal JSON API response", () => {
    expect(isH3SwallowedErrorBody('{"order":{"id":"123"}}')).toBe(false);
  });

  it("rejects unhandled:true with a different message", () => {
    expect(isH3SwallowedErrorBody('{"unhandled":true,"message":"SomethingElse"}')).toBe(false);
  });

  it("rejects the right message with unhandled not strictly true", () => {
    expect(isH3SwallowedErrorBody('{"unhandled":"true","message":"HTTPError"}')).toBe(false);
    expect(isH3SwallowedErrorBody('{"unhandled":false,"message":"HTTPError"}')).toBe(false);
  });

  it("returns false instead of throwing on malformed JSON", () => {
    expect(isH3SwallowedErrorBody("not json at all")).toBe(false);
  });

  it("returns false on an empty body", () => {
    expect(isH3SwallowedErrorBody("")).toBe(false);
  });
});
