import { afterEach, describe, expect, it } from "vitest";
import { applySecurityHeaders } from "./security-headers";

describe("applySecurityHeaders", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
  });

  it("always sets the baseline headers regardless of environment", () => {
    process.env.NODE_ENV = "development";
    const headers = new Headers();

    applySecurityHeaders(headers);

    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headers.get("Permissions-Policy")).toBe("camera=(), microphone=(), geolocation=(self)");
  });

  it("omits CSP and HSTS outside production", () => {
    process.env.NODE_ENV = "development";
    const headers = new Headers();

    applySecurityHeaders(headers);

    expect(headers.has("Content-Security-Policy")).toBe(false);
    expect(headers.has("Strict-Transport-Security")).toBe(false);
  });

  it("adds CSP and HSTS only in production", () => {
    process.env.NODE_ENV = "production";
    const headers = new Headers();

    applySecurityHeaders(headers);

    expect(headers.has("Content-Security-Policy")).toBe(true);
    expect(headers.get("Strict-Transport-Security")).toBe(
      "max-age=63072000; includeSubDomains; preload",
    );
  });

  it("sets a CSP that blocks framing, inline objects, and forces HTTPS upgrade", () => {
    process.env.NODE_ENV = "production";
    const headers = new Headers();

    applySecurityHeaders(headers);

    const csp = headers.get("Content-Security-Policy") ?? "";
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("upgrade-insecure-requests");
    expect(csp).toContain("default-src 'self'");
  });

  it("allows Supabase hosts in connect-src", () => {
    process.env.NODE_ENV = "production";
    const headers = new Headers();

    applySecurityHeaders(headers);

    const csp = headers.get("Content-Security-Policy") ?? "";
    expect(csp).toContain("https://*.supabase.co");
  });

  it("does not allow Shopify hosts in connect-src — Supabase is the sole catalog source (ADR-002)", () => {
    process.env.NODE_ENV = "production";
    const headers = new Headers();

    applySecurityHeaders(headers);

    const csp = headers.get("Content-Security-Policy") ?? "";
    expect(csp).not.toContain("myshopify.com");
    expect(csp).not.toContain("shopify.com");
  });

  it("treats test environment the same as development (no CSP/HSTS)", () => {
    process.env.NODE_ENV = "test";
    const headers = new Headers();

    applySecurityHeaders(headers);

    expect(headers.has("Content-Security-Policy")).toBe(false);
  });
});
