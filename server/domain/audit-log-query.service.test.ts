import { describe, expect, it, vi } from "vitest";
import { AuditLogQueryService } from "@server/domain/audit-log-query.service";
import type { IAuditLog, AuditRecord, AuditRecordListResult } from "@server/ports/audit-log.port";
import type { IProfileRepository } from "@server/ports/profile.repository";
import type { IProductRepository } from "@server/ports/product.repository";
import type { ISupplierRepository } from "@server/ports/supplier.repository";
import type { IAdminDeliveryZoneRepository } from "@server/ports/delivery-zone-admin.repository";
import type { ProfileDTO } from "@shared/contracts/user";
import type { ProductDTO } from "@shared/contracts/catalog";

function fakeAuditLog(result: AuditRecordListResult): IAuditLog {
  return {
    append: vi.fn(async () => {}),
    list: vi.fn(async () => result),
  };
}

function fakeProfiles(byId: Record<string, ProfileDTO | null> = {}): IProfileRepository {
  return {
    getById: vi.fn(async (userId: string) => byId[userId] ?? null),
    update: vi.fn(async () => {
      throw new Error("not used in these tests");
    }),
  };
}

function fakeProducts(byId: Record<string, ProductDTO | null> = {}): IProductRepository {
  return {
    list: vi.fn(),
    getBySlug: vi.fn(async () => null),
    getById: vi.fn(async (id: string) => byId[id] ?? null),
    getManyByIds: vi.fn(async () => []),
    getManyBySlugs: vi.fn(async () => []),
    checkStock: vi.fn(async () => true),
    reserveStock: vi.fn(async () => {}),
    releaseStock: vi.fn(async () => {}),
    increaseStock: vi.fn(async () => {}),
  } as unknown as IProductRepository;
}

function fakeSuppliers(): ISupplierRepository {
  return {
    list: vi.fn(),
    getById: vi.fn(async () => null),
    create: vi.fn(),
    update: vi.fn(),
  } as unknown as ISupplierRepository;
}

function fakeDeliveryZones(): IAdminDeliveryZoneRepository {
  return {
    list: vi.fn(),
    getById: vi.fn(async () => null),
    create: vi.fn(),
    update: vi.fn(),
    deactivate: vi.fn(),
  } as unknown as IAdminDeliveryZoneRepository;
}

function makeEntry(overrides: Partial<AuditRecord>): AuditRecord {
  return {
    id: "entry-1",
    action: "order.confirmed",
    occurredAt: "2026-08-29T00:00:00.000Z",
    entityType: "order",
    entityId: "order-1",
    actorId: null,
    payload: {},
    ...overrides,
  };
}

describe("AuditLogQueryService.list", () => {
  it("delegates params through to the audit log port", async () => {
    const auditLog = fakeAuditLog({ items: [], total: 0, page: 2, pageSize: 50, hasMore: false });
    const service = new AuditLogQueryService(
      auditLog,
      fakeProfiles(),
      fakeProducts(),
      fakeSuppliers(),
      fakeDeliveryZones(),
    );

    await service.list({ action: "order.confirmed", page: 2 });

    expect(auditLog.list).toHaveBeenCalledWith({ action: "order.confirmed", page: 2 });
  });

  it("resolves an order's entityName from the orderNumber already in its payload — no lookup needed", async () => {
    const entry = makeEntry({
      action: "order.confirmed",
      entityType: "order",
      entityId: "order-1",
      payload: { orderNumber: 4821 },
    });
    const auditLog = fakeAuditLog({
      items: [entry],
      total: 1,
      page: 1,
      pageSize: 50,
      hasMore: false,
    });
    const service = new AuditLogQueryService(
      auditLog,
      fakeProfiles(),
      fakeProducts(),
      fakeSuppliers(),
      fakeDeliveryZones(),
    );

    const result = await service.list({});

    expect(result.items[0].entityName).toBe("4821");
  });

  it("falls back to a live product lookup when the payload has no name (stock.received)", async () => {
    const entry = makeEntry({
      action: "stock.received",
      entityType: "product",
      entityId: "product-1",
      actorId: "staff-1",
      payload: { quantity: 10 },
    });
    const auditLog = fakeAuditLog({
      items: [entry],
      total: 1,
      page: 1,
      pageSize: 50,
      hasMore: false,
    });
    const products = fakeProducts({
      "product-1": { id: "product-1", name: "Молоко 1л" } as ProductDTO,
    });
    const profiles = fakeProfiles({
      "staff-1": { id: "staff-1", fullName: "Айгуль Т.", phone: null, roles: [], createdAt: "" },
    });
    const service = new AuditLogQueryService(
      auditLog,
      profiles,
      products,
      fakeSuppliers(),
      fakeDeliveryZones(),
    );

    const result = await service.list({});

    expect(result.items[0].entityName).toBe("Молоко 1л");
    expect(result.items[0].actorName).toBe("Айгуль Т.");
    expect(result.items[0].actorKind).toBe("resolved");
  });

  it("returns entityName null when a lookup finds nothing (deleted/unresolvable entity)", async () => {
    const entry = makeEntry({
      action: "stock.received",
      entityType: "product",
      entityId: "gone",
      payload: {},
    });
    const auditLog = fakeAuditLog({
      items: [entry],
      total: 1,
      page: 1,
      pageSize: 50,
      hasMore: false,
    });
    const service = new AuditLogQueryService(
      auditLog,
      fakeProfiles(),
      fakeProducts(),
      fakeSuppliers(),
      fakeDeliveryZones(),
    );

    const result = await service.list({});

    expect(result.items[0].entityName).toBeNull();
  });

  it("marks a null actorId on a known automated action as actorKind 'system'", async () => {
    const entry = makeEntry({ action: "payment.expired", actorId: null });
    const auditLog = fakeAuditLog({
      items: [entry],
      total: 1,
      page: 1,
      pageSize: 50,
      hasMore: false,
    });
    const service = new AuditLogQueryService(
      auditLog,
      fakeProfiles(),
      fakeProducts(),
      fakeSuppliers(),
      fakeDeliveryZones(),
    );

    const result = await service.list({});

    expect(result.items[0].actorKind).toBe("system");
    expect(result.items[0].actorName).toBeNull();
  });

  it("marks a null actorId on a non-automated action as actorKind 'unknown', not 'system'", async () => {
    const entry = makeEntry({ action: "category.created", actorId: null });
    const auditLog = fakeAuditLog({
      items: [entry],
      total: 1,
      page: 1,
      pageSize: 50,
      hasMore: false,
    });
    const service = new AuditLogQueryService(
      auditLog,
      fakeProfiles(),
      fakeProducts(),
      fakeSuppliers(),
      fakeDeliveryZones(),
    );

    const result = await service.list({});

    expect(result.items[0].actorKind).toBe("unknown");
  });

  it("marks a present but unresolvable actorId as 'unresolved'", async () => {
    const entry = makeEntry({ action: "stock.received", actorId: "deleted-user" });
    const auditLog = fakeAuditLog({
      items: [entry],
      total: 1,
      page: 1,
      pageSize: 50,
      hasMore: false,
    });
    const service = new AuditLogQueryService(
      auditLog,
      fakeProfiles(),
      fakeProducts(),
      fakeSuppliers(),
      fakeDeliveryZones(),
    );

    const result = await service.list({});

    expect(result.items[0].actorKind).toBe("unresolved");
    expect(result.items[0].actorName).toBeNull();
  });
});
