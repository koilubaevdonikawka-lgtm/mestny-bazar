import { afterEach, describe, expect, it, vi } from "vitest";
import { createSupabaseFetch, isNewSupabaseApiKey } from "@server/auth/resolve-user";

describe("isNewSupabaseApiKey", () => {
  it("recognizes the new publishable-key format", () => {
    expect(isNewSupabaseApiKey("sb_publishable_abc123")).toBe(true);
  });

  it("recognizes the new secret-key format", () => {
    expect(isNewSupabaseApiKey("sb_secret_abc123")).toBe(true);
  });

  it("rejects the legacy JWT-style anon key", () => {
    expect(isNewSupabaseApiKey("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.sig")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isNewSupabaseApiKey("")).toBe(false);
  });
});

describe("createSupabaseFetch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function stubFetch() {
    const fetchSpy = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(null, { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchSpy);
    return fetchSpy;
  }

  it("always sets the apikey header", async () => {
    const fetchSpy = stubFetch();
    const wrapped = createSupabaseFetch("sb_publishable_abc123");

    await wrapped("https://example.supabase.co/auth/v1/user");

    const init = fetchSpy.mock.calls[0][1]!;
    const headers = new Headers(init.headers);
    expect(headers.get("apikey")).toBe("sb_publishable_abc123");
  });

  it("strips Authorization when it exactly echoes the new-style key back as a bearer token", async () => {
    const fetchSpy = stubFetch();
    const wrapped = createSupabaseFetch("sb_publishable_abc123");

    await wrapped("https://example.supabase.co/auth/v1/user", {
      headers: { Authorization: "Bearer sb_publishable_abc123" },
    });

    const init = fetchSpy.mock.calls[0][1]!;
    const headers = new Headers(init.headers);
    expect(headers.has("Authorization")).toBe(false);
  });

  it("preserves the caller's Authorization (the user JWT) when it differs from the key", async () => {
    const fetchSpy = stubFetch();
    const wrapped = createSupabaseFetch("sb_publishable_abc123");

    await wrapped("https://example.supabase.co/auth/v1/user", {
      headers: { Authorization: "Bearer user-jwt-token" },
    });

    const init = fetchSpy.mock.calls[0][1]!;
    const headers = new Headers(init.headers);
    expect(headers.get("Authorization")).toBe("Bearer user-jwt-token");
  });

  it("does not strip Authorization for legacy (non sb_*) keys even if it echoes the key", async () => {
    const fetchSpy = stubFetch();
    const legacyKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.legacy.sig";
    const wrapped = createSupabaseFetch(legacyKey);

    await wrapped("https://example.supabase.co/auth/v1/user", {
      headers: { Authorization: `Bearer ${legacyKey}` },
    });

    const init = fetchSpy.mock.calls[0][1]!;
    const headers = new Headers(init.headers);
    expect(headers.get("Authorization")).toBe(`Bearer ${legacyKey}`);
  });

  it("applies the auth fetch timeout when the caller passes no signal", async () => {
    const fetchSpy = stubFetch();
    const wrapped = createSupabaseFetch("sb_publishable_abc123");

    await wrapped("https://example.supabase.co/auth/v1/user");

    const init = fetchSpy.mock.calls[0][1]!;
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("preserves the caller's own signal instead of overriding it with the timeout", async () => {
    const fetchSpy = stubFetch();
    const wrapped = createSupabaseFetch("sb_publishable_abc123");
    const controller = new AbortController();

    await wrapped("https://example.supabase.co/auth/v1/user", { signal: controller.signal });

    const init = fetchSpy.mock.calls[0][1]!;
    expect(init.signal).toBe(controller.signal);
  });
});
