/**
 * Google OAuth2 service-account flow (RFC 7523 JWT bearer grant), signed via
 * the platform Web Crypto API (`crypto.subtle`) — deliberately not
 * `firebase-admin` (Node-only, incompatible with the Cloudflare Workers
 * runtime this app deploys to) and not a signing library like
 * `@mancho.devs/authorizer` (finik.adapter.ts's `Signer`, node-jose-backed —
 * fine for Finik, but this is a self-contained, dependency-free flow with no
 * webhook-verification counterpart to justify pulling in a library).
 *
 * Задача №215 — used by FcmPushAdapter to obtain a short-lived access_token
 * for the FCM HTTP v1 API (`https://fcm.googleapis.com/v1/projects/{id}/messages:send`),
 * which — unlike the legacy FCM server-key API — requires OAuth2, not a
 * static API key.
 */

export interface GoogleServiceAccount {
  project_id: string;
  client_email: string;
  private_key: string;
}

interface CachedToken {
  accessToken: string;
  /** epoch ms */
  expiresAt: number;
}

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const FCM_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
/** Google issues 3600s tokens; refresh a minute early so a slow request never straddles real expiry. */
const EXPIRY_SAFETY_MARGIN_MS = 60_000;

/**
 * Module-level cache: Workers isolates persist across requests within the
 * same instance, so caching here avoids re-signing a JWT and round-tripping
 * to Google on every single push send. Keyed by client_email so a
 * misconfigured/rotated service account never serves a stale token for a
 * different one (defensive — in practice there is only ever one).
 */
const tokenCache = new Map<string, CachedToken>();

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlEncodeString(value: string): string {
  return base64UrlEncode(new TextEncoder().encode(value));
}

/**
 * Wrangler secrets round-trip a pasted multi-line PEM as literal two-character
 * `\n` sequences (see finik.adapter.ts's `normalizePem` — the same documented
 * gotcha), and since the whole service-account JSON is stored as one secret
 * value, `private_key` may carry either real newlines (properly JSON-escaped,
 * the normal case after `JSON.parse`) or leftover literal `\n` from an extra
 * layer of stringification. Stripping ALL whitespace *and* literal `\n`
 * before base64-decoding makes the import correct regardless of which form
 * survived — the PEM body's line breaks are cosmetic, base64 doesn't care.
 */
function pemToPkcs8Bytes(pem: string): ArrayBuffer {
  const base64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\\n/g, "")
    .replace(/\s+/g, "");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function importSigningKey(privateKeyPem: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "pkcs8",
    pemToPkcs8Bytes(privateKeyPem),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function signAssertionJwt(account: GoogleServiceAccount, now: number): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: account.client_email,
    scope: FCM_SCOPE,
    aud: TOKEN_URL,
    iat: Math.floor(now / 1000),
    exp: Math.floor(now / 1000) + 3600,
  };
  const signingInput = `${base64UrlEncodeString(JSON.stringify(header))}.${base64UrlEncodeString(JSON.stringify(claims))}`;

  const key = await importSigningKey(account.private_key);
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(signingInput),
  );

  return `${signingInput}.${base64UrlEncode(new Uint8Array(signature))}`;
}

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

/** Exchanges a signed JWT assertion for an OAuth2 access_token (RFC 7523 §2.1). */
async function exchangeForAccessToken(assertion: string): Promise<GoogleTokenResponse> {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Google OAuth2 token exchange failed: HTTP ${response.status} ${text}`);
  }

  return response.json();
}

/** Returns a valid FCM-scoped access_token, reusing the cached one when it hasn't expired. */
export async function getGoogleAccessToken(account: GoogleServiceAccount): Promise<string> {
  const cached = tokenCache.get(account.client_email);
  const now = Date.now();
  if (cached && cached.expiresAt - EXPIRY_SAFETY_MARGIN_MS > now) {
    return cached.accessToken;
  }

  const assertion = await signAssertionJwt(account, now);
  const token = await exchangeForAccessToken(assertion);

  tokenCache.set(account.client_email, {
    accessToken: token.access_token,
    expiresAt: now + token.expires_in * 1000,
  });
  return token.access_token;
}

/** Parses+validates the FIREBASE_SERVICE_ACCOUNT_JSON secret's shape once, at adapter construction time — fail fast on a malformed secret rather than on the first push send. */
export function parseGoogleServiceAccount(json: string): GoogleServiceAccount {
  const parsed: unknown = JSON.parse(json);
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof (parsed as Record<string, unknown>).project_id !== "string" ||
    typeof (parsed as Record<string, unknown>).client_email !== "string" ||
    typeof (parsed as Record<string, unknown>).private_key !== "string"
  ) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON is not a valid service account JSON (missing project_id/client_email/private_key)",
    );
  }
  return parsed as GoogleServiceAccount;
}
