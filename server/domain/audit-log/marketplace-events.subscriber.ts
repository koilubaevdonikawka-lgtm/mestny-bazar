import { randomUUID } from "node:crypto";

import type { IAuditLog, AuditAction } from "@server/ports/audit-log.port";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import type { OrderDTO } from "@shared/contracts/order";

function orderPayload(order: OrderDTO, extra: Record<string, unknown> = {}) {
  return {
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    total: order.total,
    currency: order.currency,
    itemCount: order.items.length,
    ...extra,
  };
}

/** Registers Audit Log as a marketplace event subscriber — a direct extension of an existing pattern, not a new mechanism (orders.md). */
export function subscribeAuditLog(bus: IMarketplaceEventBus, auditLog: IAuditLog): void {
  const logOrderEvent =
    (action: AuditAction, extra: (order: OrderDTO) => Record<string, unknown>) =>
    async (event: { order: OrderDTO }) => {
      await auditLog.append({
        id: randomUUID(),
        action,
        occurredAt: new Date().toISOString(),
        entityType: "order",
        entityId: event.order.id,
        actorId: null,
        payload: orderPayload(event.order, extra(event.order)),
      });
    };

  bus.subscribe("order.created", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "order.created",
      occurredAt: new Date().toISOString(),
      entityType: "order",
      entityId: event.order.id,
      actorId: null,
      payload: orderPayload(event.order),
    });
  });

  bus.subscribe("order.cancelled", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "order.cancelled",
      occurredAt: new Date().toISOString(),
      entityType: "order",
      entityId: event.order.id,
      actorId: null,
      payload: orderPayload(event.order, { reason: event.reason }),
    });
  });

  bus.subscribe(
    "order.operational_cascade_started",
    logOrderEvent("order.operational_cascade_started", () => ({})),
  );
  bus.subscribe(
    "order.confirmed",
    logOrderEvent("order.confirmed", () => ({})),
  );
  bus.subscribe(
    "order.assembling_started",
    logOrderEvent("order.assembling_started", () => ({})),
  );
  bus.subscribe(
    "order.ready_for_delivery",
    logOrderEvent("order.ready_for_delivery", () => ({})),
  );
  bus.subscribe(
    "order.out_for_delivery",
    logOrderEvent("order.out_for_delivery", () => ({})),
  );
  bus.subscribe(
    "order.arrived",
    logOrderEvent("order.arrived", () => ({})),
  );
  bus.subscribe(
    "order.delivered",
    logOrderEvent("order.delivered", () => ({})),
  );

  bus.subscribe("category.created", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "category.created",
      occurredAt: new Date().toISOString(),
      entityType: "category",
      entityId: event.category.id,
      actorId: null,
      payload: { name: event.category.name, slug: event.category.slug },
    });
  });

  bus.subscribe("category.updated", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "category.updated",
      occurredAt: new Date().toISOString(),
      entityType: "category",
      entityId: event.category.id,
      actorId: null,
      payload: { name: event.category.name, slug: event.category.slug },
    });
  });

  bus.subscribe("stock.low", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "stock.low",
      occurredAt: new Date().toISOString(),
      entityType: "product",
      entityId: event.productId,
      actorId: null,
      payload: { stock: event.stock, threshold: event.threshold },
    });
  });

  bus.subscribe("stock.depleted", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "stock.depleted",
      occurredAt: new Date().toISOString(),
      entityType: "product",
      entityId: event.productId,
      actorId: null,
      payload: {},
    });
  });
}
