import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
  getGoogleAccessToken,
  parseGoogleServiceAccount,
  type GoogleServiceAccount,
} from "@server/adapters/notifications/google-service-account-jwt";

let privateKeyPem: string;
let publicKey: CryptoKey;

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function toPem(buffer: ArrayBuffer, label: string): string {
  const base64 = bufferToBase64(buffer);
  const lines = base64.match(/.{1,64}/g) ?? [base64];
  return `-----BEGIN ${label}-----\n${lines.join("\n")}\n-----END ${label}-----`;
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function decodeJwtPart(part: string): Record<string, unknown> {
  return JSON.parse(new TextDecoder().decode(base64UrlDecode(part)));
}

beforeAll(async () => {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"],
  );
  const privateKeyBuffer = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
  privateKeyPem = toPem(privateKeyBuffer, "PRIVATE KEY");
  publicKey = keyPair.publicKey;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubFetch(handler: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) {
  const spy = vi.fn(handler);
  vi.stubGlobal("fetch", spy);
  return spy;
}

function makeAccount(overrides: Partial<GoogleServiceAccount> = {}): GoogleServiceAccount {
  return {
    project_id: "mestny-bazar",
    client_email: `firebase-adminsdk@mestny-bazar.iam.gserviceaccount.com-${Math.random()}`,
    private_key: privateKeyPem,
    ...overrides,
  };
}

describe("parseGoogleServiceAccount", () => {
  it("parses a valid service account JSON", () => {
    const json = JSON.stringify({
      type: "service_account",
      project_id: "mestny-bazar",
      client_email: "sa@mestny-bazar.iam.gserviceaccount.com",
      private_key: "-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----\n",
    });
    const account = parseGoogleServiceAccount(json);
    expect(account.project_id).toBe("mestny-bazar");
    expect(account.client_email).toBe("sa@mestny-bazar.iam.gserviceaccount.com");
  });

  it("throws on missing required fields instead of silently proceeding", () => {
    expect(() => parseGoogleServiceAccount(JSON.stringify({ project_id: "x" }))).toThrow();
  });

  it("throws on invalid JSON", () => {
    expect(() => parseGoogleServiceAccount("not json")).toThrow();
  });
});

describe("getGoogleAccessToken", () => {
  it("signs a valid RS256 JWT bearer assertion and exchanges it for an access_token", async () => {
    const account = makeAccount();
    const fetchSpy = stubFetch(async () =>
      Response.json({ access_token: "fake-access-token", expires_in: 3600, token_type: "Bearer" }),
    );

    const token = await getGoogleAccessToken(account);

    expect(token).toBe("fake-access-token");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://oauth2.googleapis.com/token");
    expect(init?.method).toBe("POST");

    const body = new URLSearchParams(init?.body as string);
    expect(body.get("grant_type")).toBe("urn:ietf:params:oauth:grant-type:jwt-bearer");
    const assertion = body.get("assertion");
    expect(assertion).toBeTruthy();

    const [headerPart, claimsPart, signaturePart] = assertion!.split(".");
    expect(decodeJwtPart(headerPart)).toEqual({ alg: "RS256", typ: "JWT" });
    const claims = decodeJwtPart(claimsPart);
    expect(claims.iss).toBe(account.client_email);
    expect(claims.aud).toBe("https://oauth2.googleapis.com/token");
    expect(claims.scope).toBe("https://www.googleapis.com/auth/firebase.messaging");
    expect(typeof claims.iat).toBe("number");
    expect((claims.exp as number) - (claims.iat as number)).toBe(3600);

    const signingInput = `${headerPart}.${claimsPart}`;
    const verified = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      publicKey,
      base64UrlDecode(signaturePart) as unknown as BufferSource,
      new TextEncoder().encode(signingInput),
    );
    expect(verified).toBe(true);
  });

  it("caches the access_token and does not re-sign/re-fetch on a second call before expiry", async () => {
    const account = makeAccount();
    const fetchSpy = stubFetch(async () =>
      Response.json({ access_token: "cached-token", expires_in: 3600, token_type: "Bearer" }),
    );

    const first = await getGoogleAccessToken(account);
    const second = await getGoogleAccessToken(account);

    expect(first).toBe("cached-token");
    expect(second).toBe("cached-token");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("re-fetches once the cached token has expired", async () => {
    const account = makeAccount();
    let call = 0;
    const fetchSpy = stubFetch(async () => {
      call += 1;
      return Response.json({
        access_token: call === 1 ? "first-token" : "second-token",
        // Already-expired token (negative effective TTL past the safety margin) forces an immediate refresh on the next call.
        expires_in: -120,
        token_type: "Bearer",
      });
    });

    const first = await getGoogleAccessToken(account);
    const second = await getGoogleAccessToken(account);

    expect(first).toBe("first-token");
    expect(second).toBe("second-token");
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("throws with the response body when Google rejects the token exchange", async () => {
    const account = makeAccount();
    stubFetch(
      async () =>
        new Response(JSON.stringify({ error: "invalid_grant" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }),
    );

    await expect(getGoogleAccessToken(account)).rejects.toThrow(/400/);
  });
});
