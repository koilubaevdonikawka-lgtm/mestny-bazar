import { describe, expect, it, vi } from "vitest";
import { AuditLogQueryService } from "@server/domain/audit-log-query.service";
import type { IAuditLog } from "@server/ports/audit-log.port";

function fakeAuditLog(overrides: Partial<IAuditLog> = {}): IAuditLog {
  return {
    append: vi.fn(async () => {}),
    list: vi.fn(async () => ({ items: [], total: 0, page: 1, pageSize: 50, hasMore: false })),
    ...overrides,
  };
}

describe("AuditLogQueryService.list", () => {
  it("delegates params through to the audit log port", async () => {
    const auditLog = fakeAuditLog();
    const service = new AuditLogQueryService(auditLog);

    await service.list({ action: "order.confirmed", page: 2 });

    expect(auditLog.list).toHaveBeenCalledWith({ action: "order.confirmed", page: 2 });
  });

  it("returns whatever the port returns", async () => {
    const result = { items: [], total: 5, page: 1, pageSize: 50, hasMore: false };
    const auditLog = fakeAuditLog({ list: vi.fn(async () => result) });
    const service = new AuditLogQueryService(auditLog);

    expect(await service.list({})).toBe(result);
  });
});
