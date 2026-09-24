import type {
  TelegramLoginPayload,
  TelegramLoginSessionDTO,
} from "@shared/contracts/telegram-login";
import type { ITelegramIdentityRepository } from "@server/ports/telegram-identity.repository";
import { verifyTelegramLoginPayload } from "@server/domain/telegram-login/verify-telegram-login-payload";

/**
 * Задача №302 — orchestrates the two steps the executor needs: verify the
 * widget's HMAC (pure, no I/O — see verify-telegram-login-payload.ts), then
 * ask the repository port to find-or-create the matching Supabase account
 * and issue it a real session. The bot token itself is a caller-supplied
 * argument, not read from getServerEnv() in here, so this stays testable
 * with a fake token and never needs to know the env-var name it came from.
 *
 * Задача №302B — the caller (telegram-login.executor.ts) must always pass
 * env.TELEGRAM_LOGIN_BOT_TOKEN (@MestnyBazar_Bot) here, never
 * env.TELEGRAM_BOT_TOKEN (the unrelated seller product-intake bot,
 * 86.Don.kg_bot) — see server/config/env.ts's doc comments on both.
 */
export class TelegramLoginService {
  constructor(private readonly identities: ITelegramIdentityRepository) {}

  async signIn(payload: TelegramLoginPayload, botToken: string): Promise<TelegramLoginSessionDTO> {
    await verifyTelegramLoginPayload(payload, botToken);

    const session = await this.identities.issueSession({
      telegramId: payload.id,
      firstName: payload.first_name,
      lastName: payload.last_name,
      username: payload.username,
      photoUrl: payload.photo_url,
    });

    return { tokenHash: session.tokenHash, verificationType: session.verificationType };
  }
}
