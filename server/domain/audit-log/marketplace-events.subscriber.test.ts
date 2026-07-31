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
});
