import type {
  TelegramLoginPayload,
  TelegramLoginSessionDTO,
} from "@shared/contracts/telegram-login";
import { getServerEnv } from "@server/config/env";
import { getServices } from "@server/di/container";
import { RateLimitPolicy } from "@server/domain/rate-limit.service";
import { enforceRateLimit } from "@server/functions/rate-limit.guard";
import { TelegramLoginNotConfiguredError } from "@server/domain/telegram-login/telegram-login.errors";

/**
 * Задача №302 — public, anonymous by design (this IS how a signed-out buyer
 * signs in, same trust level as Google OAuth — which never even calls a
 * server function, Supabase's client SDK handles that entirely in the
 * browser). Rate-limited the same way executeClaimBootstrap() is: the one
 * other server-side "attempt"-style auth action in this codebase.
 */
export async function executeTelegramLogin(
  payload: TelegramLoginPayload,
): Promise<TelegramLoginSessionDTO> {
  await enforceRateLimit(RateLimitPolicy.TELEGRAM_LOGIN);

  const botToken = getServerEnv().TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    throw new TelegramLoginNotConfiguredError();
  }

  return getServices().telegramLoginService.signIn(payload, botToken);
}
