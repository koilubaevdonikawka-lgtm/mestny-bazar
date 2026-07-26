import { describe, expect, it } from "vitest";
import { isDeclaredBodyTooLarge, MAX_REQUEST_BODY_BYTES } from "./request-limits";

function makeRequest(method: string, contentLength?: string): Request {
  const headers = new Headers();
  if (contentLength !== undefined) headers.set("content-length", contentLength);
  return new Request("http://localhost/api/orders", { method, headers });
}

describe("isDeclaredBodyTooLarge", () => {
  it("rejects a POST declaring a size over the limit", () => {
    expect(isDeclaredBodyTooLarge(makeRequest("POST", String(MAX_REQUEST_BODY_BYTES + 1)))).toBe(
      true,
    );
  });

  it("accepts a POST declaring a size at or under the limit", () => {
    expect(isDeclaredBodyTooLarge(makeRequest("POST", String(MAX_REQUEST_BODY_BYTES)))).toBe(false);
    expect(isDeclaredBodyTooLarge(makeRequest("POST", "1024"))).toBe(false);
  });

  it("does not reject when Content-Length is absent — falls through to the platform cap", () => {
    expect(isDeclaredBodyTooLarge(makeRequest("POST"))).toBe(false);
  });

  it("ignores GET requests regardless of any declared length", () => {
    expect(isDeclaredBodyTooLarge(makeRequest("GET", String(MAX_REQUEST_BODY_BYTES + 1)))).toBe(
      false,
    );
  });

  it("applies to PUT, PATCH, and DELETE the same as POST", () => {
    for (const method of ["PUT", "PATCH", "DELETE"]) {
      expect(isDeclaredBodyTooLarge(makeRequest(method, String(MAX_REQUEST_BODY_BYTES + 1)))).toBe(
        true,
      );
    }
  });
});
