import type {
  TelegramLoginPayload,
  TelegramLoginSessionDTO,
} from "@shared/contracts/telegram-login";
import { telegramLoginFn } from "@/api/telegram-auth.functions";

export async function telegramLogin(
  payload: TelegramLoginPayload,
): Promise<TelegramLoginSessionDTO> {
  return telegramLoginFn({ data: payload });
}
