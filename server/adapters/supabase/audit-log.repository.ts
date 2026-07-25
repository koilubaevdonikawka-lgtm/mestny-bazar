import type { AuditRecord, IAuditLog } from "@server/ports/audit-log.port";
import { supabaseAdmin } from "@server/adapters/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export class SupabaseAuditLog implements IAuditLog {
  async append(record: AuditRecord): Promise<void> {
    const { error } = await supabaseAdmin.from("audit_log").insert({
      id: record.id,
      action: record.action,
      occurred_at: record.occurredAt,
      entity_type: record.entityType,
      entity_id: record.entityId,
      actor_id: record.actorId,
      payload: record.payload as Json,
    });

    if (error) {
      throw new Error(`Failed to append audit record: ${error.message}`);
    }
  }
}
