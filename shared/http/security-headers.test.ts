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

  it("allows Cloudflare's own Web Analytics beacon in script-src and connect-src", () => {
    process.env.NODE_ENV = "production";
    const headers = new Headers();

    applySecurityHeaders(headers);

    const csp = headers.get("Content-Security-Policy") ?? "";
    expect(csp).toContain(
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com",
    );
    expect(csp).toContain(
      "connect-src 'self' https://*.supabase.co https://static.cloudflareinsights.com",
    );
  });

  it("Задача №158 — allows Yandex Maps JS API 2.1's documented domains in script-src and connect-src", () => {
    process.env.NODE_ENV = "production";
    const headers = new Headers();

    applySecurityHeaders(headers);

    const csp = headers.get("Content-Security-Policy") ?? "";
    const yandexDomains = [
      "https://api-maps.yandex.ru",
      "https://*.api-maps.yandex.ru",
      "https://suggest-maps.yandex.ru",
      "https://*.maps.yandex.net",
      "https://yandex.ru",
    ];
    const [, scriptSrc, styleSrc, , , connectSrc, frameSrc, childSrc] = csp
      .split("; ")
      .map((directive) => directive);
    for (const domain of yandexDomains) {
      expect(scriptSrc).toContain(domain);
      expect(connectSrc).toContain(domain);
    }
    expect(scriptSrc).toContain("'unsafe-eval'");
    expect(styleSrc).toContain("blob:");
    // Задача №302 appended oauth.telegram.org to both — see that test below.
    expect(frameSrc).toBe("frame-src 'self' https://api-maps.yandex.ru https://oauth.telegram.org");
    expect(childSrc).toBe("child-src 'self' https://api-maps.yandex.ru https://oauth.telegram.org");
  });

  it("Задача №158 — allows 2GIS MapGL's empirically-determined domains in script-src/connect-src, and its blob: worker in worker-src", () => {
    process.env.NODE_ENV = "production";
    const headers = new Headers();

    applySecurityHeaders(headers);

    const csp = headers.get("Content-Security-Policy") ?? "";
    expect(csp).toContain("https://mapgl.2gis.com");
    expect(csp).toContain("https://*.maps.2gis.com");
    expect(csp).toContain("https://keys.api.2gis.com");
    expect(csp).toContain("https://styles.api.2gis.com");
    expect(csp).toContain("https://disk.2gis.com");
    expect(csp).toContain("https://jam.api.2gis.com");
    expect(csp).toContain("https://s1.bss.2gis.com");
    expect(csp).toContain("worker-src 'self' blob:");
    // Staging/test-only domains found in the same script must not be allowed.
    expect(csp).not.toContain("web-staging.2gis.ru");
  });

  it("Задача №158 — allows Nominatim reverse geocoding in connect-src", () => {
    process.env.NODE_ENV = "production";
    const headers = new Headers();

    applySecurityHeaders(headers);

    const csp = headers.get("Content-Security-Policy") ?? "";
    expect(csp).toContain("https://nominatim.openstreetmap.org");
  });

  it("Задача №302 — allows the Telegram Login Widget's two official hosts (telegram.org script, oauth.telegram.org iframe)", () => {
    process.env.NODE_ENV = "production";
    const headers = new Headers();

    applySecurityHeaders(headers);

    const csp = headers.get("Content-Security-Policy") ?? "";
    const [, scriptSrc, , , , connectSrc, frameSrc, childSrc] = csp
      .split("; ")
      .map((directive) => directive);
    expect(scriptSrc).toContain("https://telegram.org");
    expect(connectSrc).toContain("https://oauth.telegram.org");
    expect(frameSrc).toContain("https://oauth.telegram.org");
    expect(childSrc).toContain("https://oauth.telegram.org");
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
