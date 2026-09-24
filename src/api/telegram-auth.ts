import type {
  TelegramLoginPayload,
  TelegramLoginSessionDTO,
} from "@shared/contracts/telegram-login";
import { telegramLoginFn } from "@/api/telegram-auth.functions";

/**
 * Задача №304 — `signal` is optional and forwarded as-is to the underlying
 * fetch (createServerFn supports it natively); src/lib/auth.ts's
 * signInWithTelegram() passes an AbortSignal.timeout() so this call can
 * never hang indefinitely and leave the buyer with no feedback — see that
 * file's own doc comment for the real, reproduced bug this closes.
 */
export async function telegramLogin(
  payload: TelegramLoginPayload,
  options: { signal?: AbortSignal } = {},
): Promise<TelegramLoginSessionDTO> {
  return telegramLoginFn({ data: payload, signal: options.signal });
}
