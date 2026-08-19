import { describe, expect, it, vi } from "vitest";
import { subscribeAuditLog } from "@server/domain/audit-log/marketplace-events.subscriber";
import { MarketplaceEventsService } from "@server/domain/marketplace-events/marketplace-events.service";
import type { AuditRecord, IAuditLog } from "@server/ports/audit-log.port";
import type { OrderDTO } from "@shared/contracts/order";

function makeOrder(overrides: Partial<OrderDTO> = {}): OrderDTO {
  return {
    id: "order-1",
    orderNumber: 42,
    status: "CANCELLED",
    paymentStatus: "unpaid",
    paymentMethod: "CASH",
    subtotal: 100,
    deliveryFee: 0,
    discountAmount: 0,
    couponCode: null,
    total: 100,
    currency: "KGS",
    customerName: "Buyer",
    customerPhone: "996700000000",
    addressSnapshot: "addr",
    notes: null,
    paymentUrl: null,
    items: [],
    createdAt: new Date().toISOString(),
    paidAt: null,
    assignedCourierId: null,
    zoneId: null,
    deliveryTariffId: null,
    deliveryEtaMinMinutes: null,
    deliveryEtaMaxMinutes: null,
    ...overrides,
  };
}

function fakeAuditLog(): IAuditLog & { records: AuditRecord[] } {
  const records: AuditRecord[] = [];
  return {
    records,
    append: vi.fn(async (record: AuditRecord) => {
      records.push(record);
    }),
    list: vi.fn(async () => ({
      items: records,
      total: records.length,
      page: 1,
      pageSize: 50,
      hasMore: false,
    })),
  };
}

describe("subscribeAuditLog", () => {
  it("appends an order.created record when the event is published", async () => {
    const bus = new MarketplaceEventsService();
    const auditLog = fakeAuditLog();
    subscribeAuditLog(bus, auditLog);

    const order = makeOrder({ status: "CREATED" });
    await bus.publish({ type: "order.created", order });

    expect(auditLog.records).toHaveLength(1);
    expect(auditLog.records[0]).toMatchObject({
      action: "order.created",
      entityType: "order",
      entityId: order.id,
      payload: expect.objectContaining({ orderNumber: order.orderNumber }),
    });
  });

  it("appends an order.cancelled record, including the cancellation reason, when the event is published", async () => {
    const bus = new MarketplaceEventsService();
    const auditLog = fakeAuditLog();
    subscribeAuditLog(bus, auditLog);

    const order = makeOrder({ status: "CANCELLED" });
    await bus.publish({ type: "order.cancelled", order, reason: "customer_cancel" });

    expect(auditLog.records).toHaveLength(1);
    expect(auditLog.records[0]).toMatchObject({
      action: "order.cancelled",
      entityType: "order",
      entityId: order.id,
      payload: expect.objectContaining({
        orderNumber: order.orderNumber,
        status: "CANCELLED",
        reason: "customer_cancel",
      }),
    });
  });

  it("does not append an order.created record for an order.cancelled event, and vice versa", async () => {
    const bus = new MarketplaceEventsService();
    const auditLog = fakeAuditLog();
    subscribeAuditLog(bus, auditLog);

    await bus.publish({ type: "order.cancelled", order: makeOrder(), reason: "customer_cancel" });

    expect(auditLog.records).toHaveLength(1);
    expect(auditLog.records[0].action).toBe("order.cancelled");
  });

  it("appends a record for every order status-transition event (orders.md)", async () => {
    const bus = new MarketplaceEventsService();
    const auditLog = fakeAuditLog();
    subscribeAuditLog(bus, auditLog);
    const order = makeOrder();

    await bus.publish({ type: "order.operational_cascade_started", order });
    await bus.publish({ type: "order.confirmed", order });
    await bus.publish({ type: "order.assembling_started", order });
    await bus.publish({ type: "order.ready_for_delivery", order });
    await bus.publish({ type: "order.out_for_delivery", order });
    await bus.publish({ type: "order.arrived", order });
    await bus.publish({ type: "order.delivered", order });

    expect(auditLog.records.map((r) => r.action)).toEqual([
      "order.operational_cascade_started",
      "order.confirmed",
      "order.assembling_started",
      "order.ready_for_delivery",
      "order.out_for_delivery",
      "order.arrived",
      "order.delivered",
    ]);
  });

  it("appends records for order.paid and every payment.* event (Промпт №075)", async () => {
    const bus = new MarketplaceEventsService();
    const auditLog = fakeAuditLog();
    subscribeAuditLog(bus, auditLog);
    const order = makeOrder({ status: "PAID", paymentStatus: "paid" });

    await bus.publish({ type: "order.paid", order });
    await bus.publish({ type: "payment.initiated", order, paymentId: "payment-1" });
    await bus.publish({ type: "payment.confirmed", order, paymentId: "payment-1" });
    await bus.publish({
      type: "payment.failed",
      order,
      paymentId: "payment-1",
      reason: "provider_reported_failure",
    });
    await bus.publish({ type: "payment.expired", order, paymentId: "payment-1" });

    expect(auditLog.records.map((r) => r.action)).toEqual([
      "order.paid",
      "payment.initiated",
      "payment.confirmed",
      "payment.failed",
      "payment.expired",
    ]);
    expect(auditLog.records[1].payload).toMatchObject({ paymentId: "payment-1" });
    expect(auditLog.records[3].payload).toMatchObject({
      paymentId: "payment-1",
      reason: "provider_reported_failure",
    });
  });

  it("appends category.created/category.updated records (catalog.md)", async () => {
    const bus = new MarketplaceEventsService();
    const auditLog = fakeAuditLog();
    subscribeAuditLog(bus, auditLog);
    const category = {
      id: "cat-1",
      name: "Dairy",
      slug: "dairy",
      description: null,
      imageUrl: null,
      sortOrder: 0,
      isActive: true,
      nameKg: null,
      parentId: null,
    };

    await bus.publish({ type: "category.created", category });
    await bus.publish({ type: "category.updated", category });

    expect(auditLog.records).toHaveLength(2);
    expect(auditLog.records[0]).toMatchObject({ action: "category.created", entityId: "cat-1" });
    expect(auditLog.records[1]).toMatchObject({ action: "category.updated", entityId: "cat-1" });
  });

  it("appends stock.low/stock.depleted records (warehouse.md)", async () => {
    const bus = new MarketplaceEventsService();
    const auditLog = fakeAuditLog();
    subscribeAuditLog(bus, auditLog);

    await bus.publish({ type: "stock.low", productId: "p1", stock: 3, threshold: 5 });
    await bus.publish({ type: "stock.depleted", productId: "p2" });

    expect(auditLog.records).toHaveLength(2);
    expect(auditLog.records[0]).toMatchObject({
      action: "stock.low",
      entityId: "p1",
      payload: { stock: 3, threshold: 5 },
    });
    expect(auditLog.records[1]).toMatchObject({ action: "stock.depleted", entityId: "p2" });
  });

  it("appends a product.published record (ai.md — Этап 5 retargeting)", async () => {
    const bus = new MarketplaceEventsService();
    const auditLog = fakeAuditLog();
    subscribeAuditLog(bus, auditLog);
    const product = {
      id: "prod-1",
      name: "Apples",
      slug: "apples",
      description: null,
      price: 100,
      currency: "KGS",
      unit: null,
      imageUrl: null,
      imageUrls: [],
      manufacturer: null,
      countryOfOrigin: null,
      sku: null,
      weightKg: null,
      stock: 10,
      publicationStatus: "PUBLISHED" as const,
      categoryId: null,
    };

    await bus.publish({ type: "product.published", product });

    expect(auditLog.records).toHaveLength(1);
    expect(auditLog.records[0]).toMatchObject({ action: "product.published", entityId: "prod-1" });
  });

  it("appends a stock.adjusted record (warehouse.md — Этап 5)", async () => {
    const bus = new MarketplaceEventsService();
    const auditLog = fakeAuditLog();
    subscribeAuditLog(bus, auditLog);

    await bus.publish({ type: "stock.adjusted", productId: "p1", stock: 42 });

    expect(auditLog.records).toHaveLength(1);
    expect(auditLog.records[0]).toMatchObject({
      action: "stock.adjusted",
      entityId: "p1",
      payload: { stock: 42 },
    });
  });

  it("appends a settings.changed record (settings.md — Этап 5)", async () => {
    const bus = new MarketplaceEventsService();
    const auditLog = fakeAuditLog();
    subscribeAuditLog(bus, auditLog);

    await bus.publish({
      type: "settings.changed",
      key: "finance.commission_rate",
      category: "finance",
      updatedBy: "admin-1",
    });

    expect(auditLog.records).toHaveLength(1);
    expect(auditLog.records[0]).toMatchObject({
      action: "settings.changed",
      entityId: "finance.commission_rate",
      actorId: "admin-1",
      payload: { category: "finance" },
    });
  });

  it("appends a permission.changed record (permissions.md — Этап 5)", async () => {
    const bus = new MarketplaceEventsService();
    const auditLog = fakeAuditLog();
    subscribeAuditLog(bus, auditLog);

    await bus.publish({
      type: "permission.changed",
      userId: "user-1",
      scope: "finance",
      action: "assigned",
    });

    expect(auditLog.records).toHaveLength(1);
    expect(auditLog.records[0]).toMatchObject({
      action: "permission.changed",
      entityId: "user-1",
      payload: { scope: "finance", action: "assigned" },
    });
  });

  it("appends a courier.created record (Промпт №068)", async () => {
    const bus = new MarketplaceEventsService();
    const auditLog = fakeAuditLog();
    subscribeAuditLog(bus, auditLog);

    await bus.publish({ type: "courier.created", userId: "courier-1" });

    expect(auditLog.records).toHaveLength(1);
    expect(auditLog.records[0]).toMatchObject({
      action: "courier.created",
      entityType: "courier",
      entityId: "courier-1",
    });
  });

  it("appends a courier.blocked record", async () => {
    const bus = new MarketplaceEventsService();
    const auditLog = fakeAuditLog();
    subscribeAuditLog(bus, auditLog);

    await bus.publish({ type: "courier.blocked", userId: "courier-1" });

    expect(auditLog.records).toHaveLength(1);
    expect(auditLog.records[0]).toMatchObject({
      action: "courier.blocked",
      entityType: "courier",
      entityId: "courier-1",
    });
  });

  it("appends a courier.unblocked record", async () => {
    const bus = new MarketplaceEventsService();
    const auditLog = fakeAuditLog();
    subscribeAuditLog(bus, auditLog);

    await bus.publish({ type: "courier.unblocked", userId: "courier-1" });

    expect(auditLog.records).toHaveLength(1);
    expect(auditLog.records[0]).toMatchObject({
      action: "courier.unblocked",
      entityType: "courier",
      entityId: "courier-1",
    });
  });

  it("appends an rbac.role.created record (Промпт №068 — industrial RBAC)", async () => {
    const bus = new MarketplaceEventsService();
    const auditLog = fakeAuditLog();
    subscribeAuditLog(bus, auditLog);

    await bus.publish({ type: "rbac.role.created", roleId: "role-1", name: "Менеджер" });

    expect(auditLog.records).toHaveLength(1);
    expect(auditLog.records[0]).toMatchObject({
      action: "rbac.role.created",
      entityType: "rbac_role",
      entityId: "role-1",
      payload: { name: "Менеджер" },
    });
  });

  it("appends an rbac.role.updated record", async () => {
    const bus = new MarketplaceEventsService();
    const auditLog = fakeAuditLog();
    subscribeAuditLog(bus, auditLog);

    await bus.publish({ type: "rbac.role.updated", roleId: "role-1", name: "Менеджер 2" });

    expect(auditLog.records).toHaveLength(1);
    expect(auditLog.records[0]).toMatchObject({ action: "rbac.role.updated", entityId: "role-1" });
  });

  it("appends an rbac.role.deleted record", async () => {
    const bus = new MarketplaceEventsService();
    const auditLog = fakeAuditLog();
    subscribeAuditLog(bus, auditLog);

    await bus.publish({ type: "rbac.role.deleted", roleId: "role-1", name: "Менеджер" });

    expect(auditLog.records).toHaveLength(1);
    expect(auditLog.records[0]).toMatchObject({ action: "rbac.role.deleted", entityId: "role-1" });
  });

  it("appends an rbac.permission.created record", async () => {
    const bus = new MarketplaceEventsService();
    const auditLog = fakeAuditLog();
    subscribeAuditLog(bus, auditLog);

    await bus.publish({
      type: "rbac.permission.created",
      permissionId: "perm-1",
      module: "couriers",
      action: "view",
    });

    expect(auditLog.records).toHaveLength(1);
    expect(auditLog.records[0]).toMatchObject({
      action: "rbac.permission.created",
      entityType: "rbac_permission",
      entityId: "perm-1",
      payload: { module: "couriers", action: "view" },
    });
  });

  it("appends an rbac.permission.updated record", async () => {
    const bus = new MarketplaceEventsService();
    const auditLog = fakeAuditLog();
    subscribeAuditLog(bus, auditLog);

    await bus.publish({
      type: "rbac.permission.updated",
      permissionId: "perm-1",
      module: "couriers",
      action: "edit",
    });

    expect(auditLog.records).toHaveLength(1);
    expect(auditLog.records[0]).toMatchObject({
      action: "rbac.permission.updated",
      entityId: "perm-1",
    });
  });

  it("appends an rbac.permission.deleted record", async () => {
    const bus = new MarketplaceEventsService();
    const auditLog = fakeAuditLog();
    subscribeAuditLog(bus, auditLog);

    await bus.publish({
      type: "rbac.permission.deleted",
      permissionId: "perm-1",
      module: "couriers",
      action: "edit",
    });

    expect(auditLog.records).toHaveLength(1);
    expect(auditLog.records[0]).toMatchObject({
      action: "rbac.permission.deleted",
      entityId: "perm-1",
    });
  });

  it("appends an rbac.role.assigned record", async () => {
    const bus = new MarketplaceEventsService();
    const auditLog = fakeAuditLog();
    subscribeAuditLog(bus, auditLog);

    await bus.publish({ type: "rbac.role.assigned", userId: "user-1", roleId: "role-1" });

    expect(auditLog.records).toHaveLength(1);
    expect(auditLog.records[0]).toMatchObject({
      action: "rbac.role.assigned",
      entityType: "user",
      entityId: "user-1",
      payload: { roleId: "role-1" },
    });
  });

  it("appends an rbac.role.revoked record", async () => {
    const bus = new MarketplaceEventsService();
    const auditLog = fakeAuditLog();
    subscribeAuditLog(bus, auditLog);

    await bus.publish({ type: "rbac.role.revoked", userId: "user-1", roleId: "role-1" });

    expect(auditLog.records).toHaveLength(1);
    expect(auditLog.records[0]).toMatchObject({
      action: "rbac.role.revoked",
      entityType: "user",
      entityId: "user-1",
      payload: { roleId: "role-1" },
    });
  });
});
