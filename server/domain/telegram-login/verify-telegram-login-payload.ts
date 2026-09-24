import type { TelegramLoginPayload } from "@shared/contracts/telegram-login";
import {
  InvalidTelegramSignatureError,
  StaleTelegramAuthError,
} from "@server/domain/telegram-login/telegram-login.errors";

/**
 * Задача №302 — verifies a Telegram Login Widget payload per the official
 * algorithm (https://core.telegram.org/widgets/login#checking-authorization):
 * HMAC-SHA256 of the sorted `key=value` data-check-string, keyed by
 * SHA-256(bot_token). Pure — no I/O, no Supabase — same reasoning as
 * google-service-account-jwt.ts's plain exported functions: this is a
 * self-contained crypto check with nothing to abstract behind a port, signed
 * via the platform Web Crypto API (`crypto.subtle`) so it runs identically
 * on the Cloudflare Workers runtime this app deploys to (no Node-only
 * `crypto` module).
 */

/** Replay-protection window (Задача №302's own spec) — rejects a payload whose auth_date is older than this. */
const MAX_AUTH_AGE_MS = 5 * 60 * 1000;
/** A payload timestamped further in the future than ordinary clock skew is never legitimate — Telegram always signs "now". */
const MAX_CLOCK_SKEW_MS = 60 * 1000;

function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Every field except `hash` itself, `key=value`, sorted alphabetically by
 * key, joined with `\n` — the exact string Telegram HMACs. `undefined`
 * optional fields (last_name/username/photo_url when Telegram omits them
 * entirely) are excluded, never sent as the literal string "undefined".
 */
function buildDataCheckString(payload: TelegramLoginPayload): string {
  const { hash: _hash, ...fields } = payload;
  return Object.entries(fields)
    .filter(([, value]) => value !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
}

/** Same-length, branch-on-every-byte compare — a payload hash is attacker-supplied input, so comparing it to the expected value must not leak timing information about where the two first differ. */
function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export interface VerifyTelegramLoginOptions {
  /** epoch ms — injected for testability; defaults to the real clock. */
  now?: number;
}

/**
 * Throws InvalidTelegramSignatureError or StaleTelegramAuthError on failure;
 * resolves with nothing on success. Checks auth_date first — a stale replay
 * of an otherwise-genuine (correctly-signed) payload is rejected before
 * spending the HMAC computation on it.
 */
export async function verifyTelegramLoginPayload(
  payload: TelegramLoginPayload,
  botToken: string,
  options: VerifyTelegramLoginOptions = {},
): Promise<void> {
  const now = options.now ?? Date.now();
  const authDateMs = payload.auth_date * 1000;
  if (now - authDateMs > MAX_AUTH_AGE_MS || authDateMs - now > MAX_CLOCK_SKEW_MS) {
    throw new StaleTelegramAuthError();
  }

  const dataCheckString = buildDataCheckString(payload);
  const secretKeyBytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(botToken));
  const hmacKey = await crypto.subtle.importKey(
    "raw",
    secretKeyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    hmacKey,
    new TextEncoder().encode(dataCheckString),
  );
  const expectedHash = toHex(signature);

  if (!constantTimeEquals(expectedHash, payload.hash.toLowerCase())) {
    throw new InvalidTelegramSignatureError();
  }
}
