import type {
  AuditRecord,
  AuditRecordListParams,
  AuditRecordListResult,
  IAuditLog,
} from "@server/ports/audit-log.port";
import type { AuditLogPayloadValue } from "@shared/contracts/audit-log";
import { supabaseAdmin } from "@server/adapters/supabase/client";
import type { Json } from "@/integrations/supabase/types";

interface AuditLogRow {
  id: string;
  action: string;
  occurred_at: string;
  entity_type: string;
  entity_id: string;
  actor_id: string | null;
  payload: Json;
}

function mapAuditLogRow(row: AuditLogRow): AuditRecord {
  return {
    id: row.id,
    action: row.action as AuditRecord["action"],
    occurredAt: row.occurred_at,
    entityType: row.entity_type,
    entityId: row.entity_id,
    actorId: row.actor_id,
    payload: (row.payload as Record<string, AuditLogPayloadValue> | null) ?? {},
  };
}

const AUDIT_LOG_SELECT = "id, action, occurred_at, entity_type, entity_id, actor_id, payload";

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

  async list(params: AuditRecordListParams): Promise<AuditRecordListResult> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 50;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabaseAdmin
      .from("audit_log")
      .select(AUDIT_LOG_SELECT, { count: "exact" })
      .order("occurred_at", { ascending: false })
      .range(from, to);

    if (params.action) query = query.eq("action", params.action);
    if (params.entityType) query = query.eq("entity_type", params.entityType);
    if (params.entityId) query = query.eq("entity_id", params.entityId);
    if (params.actorId) query = query.eq("actor_id", params.actorId);
    if (params.periodStart) query = query.gte("occurred_at", params.periodStart);
    if (params.periodEnd) query = query.lte("occurred_at", params.periodEnd);

    const { data, error, count } = await query;
    if (error) throw new Error(`Failed to list audit log: ${error.message}`);

    const items = (data ?? []).map(mapAuditLogRow);
    const total = count ?? items.length;

    return {
      items,
      total,
      page,
      pageSize,
      hasMore: from + items.length < total,
    };
  }
}

export { mapAuditLogRow };
