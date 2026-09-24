import { createServerFn } from "@tanstack/react-start";
import type { TelegramLoginSessionDTO } from "@shared/contracts/telegram-login";
import { telegramLoginPayloadSchema } from "@shared/validation/telegram-login.schema";

export const telegramLoginFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => telegramLoginPayloadSchema.parse(data))
  .handler(async ({ data }): Promise<TelegramLoginSessionDTO> => {
    const { executeTelegramLogin } = await import("@server/functions/telegram-login.executor");
    return executeTelegramLogin(data);
  });
