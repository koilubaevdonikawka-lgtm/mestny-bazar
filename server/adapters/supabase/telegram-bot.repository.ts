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

  async addAlbumMember(member: {
    mediaGroupId: string;
    messageId: number;
    chatId: number;
    fileId: string;
    caption: string | null;
  }): Promise<void> {
    const { error } = await supabaseAdmin.from("telegram_bot_album_members").insert({
      media_group_id: member.mediaGroupId,
      message_id: member.messageId,
      chat_id: member.chatId,
      file_id: member.fileId,
      caption: member.caption,
    });

    // 23505 (same media_group_id + message_id already recorded — a
    // redelivered update) is a harmless no-op, not an error.
    if (error && error.code !== "23505") {
      throw new Error(`Failed to record Telegram album member: ${error.message}`);
    }
  }

  async claimAlbum(
    mediaGroupId: string,
    chatId: number,
    categoryId: string | null,
  ): Promise<boolean> {
    const { error } = await supabaseAdmin.from("telegram_bot_album_claims").insert({
      media_group_id: mediaGroupId,
      chat_id: chatId,
      category_id: categoryId,
    });

    if (error) {
      if (error.code === "23505") return false;
      throw new Error(`Failed to claim Telegram album: ${error.message}`);
    }
    return true;
  }

  async getAlbumMembers(
    mediaGroupId: string,
  ): Promise<Array<{ messageId: number; fileId: string; caption: string | null }>> {
    const { data, error } = await supabaseAdmin
      .from("telegram_bot_album_members")
      .select("message_id, file_id, caption")
      .eq("media_group_id", mediaGroupId)
      .order("message_id", { ascending: true });

    if (error) throw new Error(`Failed to fetch Telegram album members: ${error.message}`);
    return (data ?? []).map((row) => ({
      messageId: row.message_id,
      fileId: row.file_id,
      caption: row.caption,
    }));
  }

  async deleteAlbum(mediaGroupId: string): Promise<void> {
    const [membersResult, claimResult] = await Promise.all([
      supabaseAdmin.from("telegram_bot_album_members").delete().eq("media_group_id", mediaGroupId),
      supabaseAdmin.from("telegram_bot_album_claims").delete().eq("media_group_id", mediaGroupId),
    ]);
    if (membersResult.error) {
      throw new Error(`Failed to clean up Telegram album members: ${membersResult.error.message}`);
    }
    if (claimResult.error) {
      throw new Error(`Failed to clean up Telegram album claim: ${claimResult.error.message}`);
    }
  }
}
