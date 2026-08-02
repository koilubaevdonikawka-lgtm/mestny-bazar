import { describe, expect, it } from "vitest";
import { mapAuditLogRow } from "@server/adapters/supabase/audit-log.repository";

describe("mapAuditLogRow", () => {
  it("maps snake_case DB fields to the camelCase AuditRecord shape", () => {
    expect(
      mapAuditLogRow({
        id: "log-1",
        action: "order.confirmed",
        occurred_at: "2026-08-01T00:00:00.000Z",
        entity_type: "order",
        entity_id: "order-1",
        actor_id: "admin-1",
        payload: { status: "CONFIRMED" },
      }),
    ).toEqual({
      id: "log-1",
      action: "order.confirmed",
      occurredAt: "2026-08-01T00:00:00.000Z",
      entityType: "order",
      entityId: "order-1",
      actorId: "admin-1",
      payload: { status: "CONFIRMED" },
    });
  });

  it("defaults a null payload to an empty object", () => {
    const mapped = mapAuditLogRow({
      id: "log-2",
      action: "customer.blocked",
      occurred_at: "2026-08-01T00:00:00.000Z",
      entity_type: "customer",
      entity_id: "user-1",
      actor_id: null,
      payload: null,
    });

    expect(mapped.payload).toEqual({});
    expect(mapped.actorId).toBeNull();
  });
});
