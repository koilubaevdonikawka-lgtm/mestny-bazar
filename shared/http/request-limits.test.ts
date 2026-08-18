import { describe, expect, it } from "vitest";
import {
  isDeclaredBodyTooLarge,
  MAX_REQUEST_BODY_BYTES,
  MULTIPART_BODY_MAX_BYTES,
} from "./request-limits";

function makeRequest(method: string, contentLength?: string, contentType?: string): Request {
  const headers = new Headers();
  if (contentLength !== undefined) headers.set("content-length", contentLength);
  if (contentType !== undefined) headers.set("content-type", contentType);
  return new Request("http://localhost/api/orders", { method, headers });
}

const MULTIPART_CONTENT_TYPE = "multipart/form-data; boundary=----WebKitFormBoundary1a2b3c";

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

  it("accepts a multipart/form-data upload at or under MULTIPART_BODY_MAX_BYTES, even though it exceeds MAX_REQUEST_BODY_BYTES", () => {
    expect(MULTIPART_BODY_MAX_BYTES).toBeGreaterThan(MAX_REQUEST_BODY_BYTES);
    expect(
      isDeclaredBodyTooLarge(
        makeRequest("POST", String(MULTIPART_BODY_MAX_BYTES), MULTIPART_CONTENT_TYPE),
      ),
    ).toBe(false);
  });

  it("rejects a multipart/form-data upload just over MULTIPART_BODY_MAX_BYTES", () => {
    expect(
      isDeclaredBodyTooLarge(
        makeRequest("POST", String(MULTIPART_BODY_MAX_BYTES + 1), MULTIPART_CONTENT_TYPE),
      ),
    ).toBe(true);
  });

  it("still rejects a plain JSON POST over MAX_REQUEST_BODY_BYTES by the old limit, not the higher multipart one", () => {
    expect(
      isDeclaredBodyTooLarge(
        makeRequest("POST", String(MAX_REQUEST_BODY_BYTES + 1), "application/json"),
      ),
    ).toBe(true);
    expect(isDeclaredBodyTooLarge(makeRequest("POST", String(MAX_REQUEST_BODY_BYTES + 1)))).toBe(
      true,
    );
  });

  it("matches Content-Type case-insensitively and with a boundary parameter", () => {
    expect(
      isDeclaredBodyTooLarge(
        makeRequest("POST", String(MULTIPART_BODY_MAX_BYTES), "Multipart/Form-Data; boundary=x"),
      ),
    ).toBe(false);
  });
});
