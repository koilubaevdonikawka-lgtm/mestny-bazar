/** The verified Telegram profile fields worth carrying onto the Supabase account, once the widget's HMAC has already checked out (server/domain/telegram-login's own concern, not this port's). */
export interface TelegramIdentity {
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
}

/** What the client needs to complete the sign-in via `supabase.auth.verifyOtp()` — see TelegramLoginSessionDTO's own doc comment (shared/contracts/telegram-login.ts) for why this carries nothing else. */
export interface IssuedTelegramSession {
  tokenHash: string;
  verificationType: string;
}

/**
 * Задача №302 — the one Supabase Auth Admin operation this feature needs:
 * find-or-create the auth.users row for a given Telegram identity and issue
 * it a real, verifyOtp()-redeemable session — never a hand-rolled JWT.
 * Behind a port for the same reason every other Supabase-backed concern in
 * this codebase is (ADR-002): server/domain/telegram-login never imports
 * @supabase/supabase-js directly, only this interface.
 */
export interface ITelegramIdentityRepository {
  issueSession(identity: TelegramIdentity): Promise<IssuedTelegramSession>;
}
