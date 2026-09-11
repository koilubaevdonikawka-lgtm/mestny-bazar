import type { ITelegramBotRepository } from "@server/ports/telegram-bot.repository";
import { supabaseAdmin } from "@server/adapters/supabase/client";

export class SupabaseTelegramBotRepository implements ITelegramBotRepository {
  async findAdmin(
    telegramUserId: number,
  ): Promise<{ telegramUserId: number; name: string } | null> {
    const { data, error } = await supabaseAdmin
      .from("telegram_bot_admins")
      .select("telegram_user_id, name")
      .eq("telegram_user_id", telegramUserId)
      .maybeSingle();

    if (error) throw new Error(`Failed to look up Telegram bot admin: ${error.message}`);
    return data ? { telegramUserId: data.telegram_user_id, name: data.name } : null;
  }

  async getSessionCategoryId(telegramChatId: number): Promise<string | null> {
    const { data, error } = await supabaseAdmin
      .from("telegram_bot_sessions")
      .select("category_id")
      .eq("telegram_chat_id", telegramChatId)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch Telegram bot session: ${error.message}`);
    return data?.category_id ?? null;
  }

  async setSessionCategoryId(telegramChatId: number, categoryId: string): Promise<void> {
    const { error } = await supabaseAdmin.from("telegram_bot_sessions").upsert(
      {
        telegram_chat_id: telegramChatId,
        category_id: categoryId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "telegram_chat_id" },
    );

    if (error) throw new Error(`Failed to save Telegram bot session: ${error.message}`);
  }

  async markUpdateProcessed(updateId: number): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from("telegram_bot_processed_updates")
      .insert({ update_id: updateId })
      .select("update_id");

    // Postgres unique-violation (23505) on the primary key means another
    // delivery of this same update_id already won the race — not a real
    // error, just "already processed." Any other error is real and propagates.
    if (error) {
      if (error.code === "23505") return false;
      throw new Error(`Failed to record Telegram update: ${error.message}`);
    }
    return (data?.length ?? 0) > 0;
  }
}
