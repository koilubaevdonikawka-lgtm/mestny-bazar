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
});
