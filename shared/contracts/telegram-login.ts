/**
 * Задача №302 — Telegram Login Widget for customers. Field names/shapes here
 * match exactly what the official widget callback hands the page (see
 * https://core.telegram.org/widgets/login) — this is the transport contract
 * between the client and the one new public server function, not a
 * database row.
 */
export interface TelegramLoginPayload {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  /** Unix seconds — when Telegram signed this payload. */
  auth_date: number;
  /** Lowercase hex HMAC-SHA256, verified server-side against TELEGRAM_BOT_TOKEN. */
  hash: string;
}

/**
 * What the client needs to finish the sign-in itself, via
 * `supabase.auth.verifyOtp({ token_hash: tokenHash, type: verificationType })`
 * — the same standard Supabase Auth exchange resolveUserIdFromRequest()'s
 * getClaims() already validates for every other sign-in method, unchanged.
 * Never the identity's email or any Telegram profile field — the client has
 * no use for either once verifyOtp() hands back a real session.
 */
export interface TelegramLoginSessionDTO {
  tokenHash: string;
  verificationType: string;
}
