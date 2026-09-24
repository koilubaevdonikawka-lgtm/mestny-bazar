import type {
  ITelegramIdentityRepository,
  IssuedTelegramSession,
  TelegramIdentity,
} from "@server/ports/telegram-identity.repository";
import { supabaseAdmin } from "@server/adapters/supabase/client";

/**
 * Задача №302 — Supabase has no native "Telegram" auth provider, and this
 * identity has no real email to log in with, so a Telegram user is mapped to
 * a synthetic, deterministic one instead of a separate telegram_id →
 * auth.users mapping table: the same telegram_id always produces the same
 * email, which IS the lookup — generateLink() below finds the existing
 * auth.users row by that email on every later login, or creates it on the
 * first one. `.internal` is the IANA-reserved TLD for exactly this (RFC
 * 8375 — guaranteed to never resolve, never collide with a real address a
 * Google sign-in might use), so there is no dedicated mapping table and no
 * duplicate role system: the existing on_auth_user_created trigger
 * (supabase/migrations/20260705202529_...sql) still fires on first creation
 * and grants the same 'customer' role in user_roles every other buyer gets.
 */
function syntheticEmailFor(telegramId: number): string {
  return `tg-${telegramId}@customers.mesnyibazar.internal`;
}

export class SupabaseTelegramIdentityRepository implements ITelegramIdentityRepository {
  /**
   * `generateLink({ type: "magiclink" })` both creates the auth.users row
   * (only on the first call for this email — a no-op find on every later
   * one) and returns a real, GoTrue-issued `hashed_token` the client
   * redeems via `supabase.auth.verifyOtp()` — never a hand-rolled JWT, never
   * an email actually sent (nothing here calls Supabase's mailer; the
   * token goes straight back to our own client instead). Exactly what
   * resolveUserIdFromRequest()'s getClaims() already validates for every
   * other sign-in method, unchanged.
   */
  async issueSession(identity: TelegramIdentity): Promise<IssuedTelegramSession> {
    const email = syntheticEmailFor(identity.telegramId);
    const fullName = [identity.firstName, identity.lastName].filter(Boolean).join(" ").trim();

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        data: {
          // Read by the on_auth_user_created trigger on first creation only
          // (COALESCE(raw_user_meta_data->>'full_name', ...)) — seeds
          // profiles.full_name so a Telegram buyer isn't asked to type
          // their name in again at checkout.
          full_name: fullName || undefined,
          telegram_id: identity.telegramId,
          telegram_username: identity.username ?? null,
          avatar_url: identity.photoUrl ?? null,
          // Marks the account's own origin, for support/debugging — never
          // read by any role/permission check (those stay on user_roles).
          auth_provider: "telegram",
        },
      },
    });

    if (error || !data) {
      throw new Error(`Failed to issue a Telegram sign-in session: ${error?.message ?? "unknown"}`);
    }

    return {
      tokenHash: data.properties.hashed_token,
      verificationType: data.properties.verification_type,
    };
  }
}
