import { randomUUID } from "node:crypto";

import type { IAuditLog } from "@server/ports/audit-log.port";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";

/** Registers Audit Log as a marketplace event subscriber. */
export function subscribeAuditLog(bus: IMarketplaceEventBus, auditLog: IAuditLog): void {
  bus.subscribe("order.created", async (event) => {
    const { order } = event;
    await auditLog.append({
      id: randomUUID(),
      action: "order.created",
      occurredAt: new Date().toISOString(),
      entityType: "order",
      entityId: order.id,
      actorId: null,
      payload: {
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        total: order.total,
        currency: order.currency,
        itemCount: order.items.length,
      },
    });
  });

  bus.subscribe("order.cancelled", async (event) => {
    const { order, reason } = event;
    await auditLog.append({
      id: randomUUID(),
      action: "order.cancelled",
      occurredAt: new Date().toISOString(),
      entityType: "order",
      entityId: order.id,
      actorId: null,
      payload: {
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        reason,
        total: order.total,
        currency: order.currency,
        itemCount: order.items.length,
      },
    });
  });
}
