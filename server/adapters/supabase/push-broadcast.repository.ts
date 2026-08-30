import type { PushBroadcastDTO } from "@shared/contracts/push-broadcast";
import type { IPushBroadcastRepository } from "@server/ports/push-broadcast.repository";
import { supabaseAdmin } from "@server/adapters/supabase/client";

interface PushBroadcastRow {
  id: string;
  title: string;
  body: string;
  recipient_count: number;
  sent_by: string;
  created_at: string;
}

function mapRow(row: PushBroadcastRow): PushBroadcastDTO {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    recipientCount: row.recipient_count,
    sentBy: row.sent_by,
    createdAt: row.created_at,
  };
}

export class SupabasePushBroadcastRepository implements IPushBroadcastRepository {
  async create(data: {
    title: string;
    body: string;
    recipientCount: number;
    sentBy: string;
  }): Promise<PushBroadcastDTO> {
    const { data: row, error } = await supabaseAdmin
      .from("push_broadcasts")
      .insert({
        title: data.title,
        body: data.body,
        recipient_count: data.recipientCount,
        sent_by: data.sentBy,
      })
      .select("id, title, body, recipient_count, sent_by, created_at")
      .single();

    if (error || !row)
      throw new Error(`Failed to record push broadcast: ${error?.message ?? "unknown"}`);
    return mapRow(row);
  }

  async getMostRecent(): Promise<PushBroadcastDTO | null> {
    const { data, error } = await supabaseAdmin
      .from("push_broadcasts")
      .select("id, title, body, recipient_count, sent_by, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch most recent push broadcast: ${error.message}`);
    return data ? mapRow(data) : null;
  }
}
