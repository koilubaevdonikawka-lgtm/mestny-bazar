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

  bus.subscribe(
    "order.paid",
    logOrderEvent("order.paid", () => ({})),
  );

  bus.subscribe("payment.initiated", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "payment.initiated",
      occurredAt: new Date().toISOString(),
      entityType: "order",
      entityId: event.order.id,
      actorId: null,
      payload: orderPayload(event.order, { paymentId: event.paymentId }),
    });
  });

  bus.subscribe("payment.confirmed", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "payment.confirmed",
      occurredAt: new Date().toISOString(),
      entityType: "order",
      entityId: event.order.id,
      actorId: null,
      payload: orderPayload(event.order, { paymentId: event.paymentId }),
    });
  });

  bus.subscribe("payment.failed", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "payment.failed",
      occurredAt: new Date().toISOString(),
      entityType: "order",
      entityId: event.order.id,
      actorId: null,
      payload: orderPayload(event.order, { paymentId: event.paymentId, reason: event.reason }),
    });
  });

  bus.subscribe("payment.expired", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "payment.expired",
      occurredAt: new Date().toISOString(),
      entityType: "order",
      entityId: event.order.id,
      actorId: null,
      payload: orderPayload(event.order, { paymentId: event.paymentId }),
    });
  });

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

  bus.subscribe("category.deleted", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "category.deleted",
      occurredAt: new Date().toISOString(),
      entityType: "category",
      entityId: event.categoryId,
      actorId: null,
      payload: { name: event.name },
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

  bus.subscribe("stock.received", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "stock.received",
      occurredAt: new Date().toISOString(),
      entityType: "product",
      entityId: event.productId,
      actorId: event.actorId,
      payload: {
        quantity: event.quantity,
        movementDate: event.movementDate,
        purchasePrice: event.purchasePrice,
        supplierId: event.supplierId,
      },
    });
  });

  bus.subscribe("stock.returned", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "stock.returned",
      occurredAt: new Date().toISOString(),
      entityType: "product",
      entityId: event.productId,
      actorId: event.actorId,
      payload: {
        quantity: event.quantity,
        movementDate: event.movementDate,
        note: event.note,
      },
    });
  });

  bus.subscribe(
    "courier.assigned",
    logOrderEvent("courier.assigned", (order) => ({ courierId: order.assignedCourierId })),
  );

  bus.subscribe("courier.status_changed", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "courier.status_changed",
      occurredAt: new Date().toISOString(),
      entityType: "courier",
      entityId: event.courierId,
      actorId: event.courierId,
      payload: { isAvailable: event.isAvailable },
    });
  });

  bus.subscribe("customer.blocked", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "customer.blocked",
      occurredAt: new Date().toISOString(),
      entityType: "customer",
      entityId: event.userId,
      actorId: null,
      payload: {},
    });
  });

  bus.subscribe("customer.unblocked", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "customer.unblocked",
      occurredAt: new Date().toISOString(),
      entityType: "customer",
      entityId: event.userId,
      actorId: null,
      payload: {},
    });
  });

  bus.subscribe("seller.registered", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "seller.registered",
      occurredAt: new Date().toISOString(),
      entityType: "seller",
      entityId: event.userId,
      actorId: event.userId,
      payload: {},
    });
  });

  bus.subscribe("seller.verified", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "seller.verified",
      occurredAt: new Date().toISOString(),
      entityType: "seller",
      entityId: event.userId,
      actorId: null,
      payload: {},
    });
  });

  bus.subscribe("seller.rejected", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "seller.rejected",
      occurredAt: new Date().toISOString(),
      entityType: "seller",
      entityId: event.userId,
      actorId: null,
      payload: {},
    });
  });

  bus.subscribe("supply.requested", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "supply.requested",
      occurredAt: new Date().toISOString(),
      entityType: "supply",
      entityId: event.supply.id,
      actorId: null,
      payload: { supplierId: event.supply.supplierId, itemCount: event.supply.items.length },
    });
  });

  bus.subscribe("supply.received", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "supply.received",
      occurredAt: new Date().toISOString(),
      entityType: "supply",
      entityId: event.supply.id,
      actorId: null,
      payload: { supplierId: event.supply.supplierId, itemCount: event.supply.items.length },
    });
  });

  bus.subscribe("role.assigned", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "role.assigned",
      occurredAt: new Date().toISOString(),
      entityType: "user",
      entityId: event.userId,
      actorId: null,
      payload: { role: event.role },
    });
  });

  bus.subscribe("role.revoked", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "role.revoked",
      occurredAt: new Date().toISOString(),
      entityType: "user",
      entityId: event.userId,
      actorId: null,
      payload: { role: event.role },
    });
  });

  bus.subscribe("coupon.created", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "coupon.created",
      occurredAt: new Date().toISOString(),
      entityType: "coupon",
      entityId: event.coupon.id,
      actorId: null,
      payload: { code: event.coupon.code, discountType: event.coupon.discountType },
    });
  });

  bus.subscribe("coupon.redeemed", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "coupon.redeemed",
      occurredAt: new Date().toISOString(),
      entityType: "coupon",
      entityId: event.coupon.id,
      actorId: null,
      payload: { code: event.coupon.code, usesCount: event.coupon.usesCount },
    });
  });

  bus.subscribe("payout.created", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "payout.created",
      occurredAt: new Date().toISOString(),
      entityType: "payout",
      entityId: event.payout.id,
      actorId: null,
      payload: { sellerId: event.payout.sellerId, payoutAmount: event.payout.payoutAmount },
    });
  });

  bus.subscribe("payout.completed", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "payout.completed",
      occurredAt: new Date().toISOString(),
      entityType: "payout",
      entityId: event.payout.id,
      actorId: null,
      payload: { sellerId: event.payout.sellerId, payoutAmount: event.payout.payoutAmount },
    });
  });

  bus.subscribe("content.published", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "content.published",
      occurredAt: new Date().toISOString(),
      entityType: "banner",
      entityId: event.banner.id,
      actorId: null,
      payload: { title: event.banner.title, isActive: event.banner.isActive },
    });
  });

  bus.subscribe("product.published", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "product.published",
      occurredAt: new Date().toISOString(),
      entityType: "product",
      entityId: event.product.id,
      actorId: null,
      payload: { name: event.product.name, slug: event.product.slug },
    });
  });

  bus.subscribe("product.deleted", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "product.deleted",
      occurredAt: new Date().toISOString(),
      entityType: "product",
      entityId: event.productId,
      actorId: null,
      payload: { name: event.name },
    });
  });

  bus.subscribe("stock.adjusted", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "stock.adjusted",
      occurredAt: new Date().toISOString(),
      entityType: "product",
      entityId: event.productId,
      actorId: null,
      payload: { stock: event.stock },
    });
  });

  bus.subscribe("settings.changed", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "settings.changed",
      occurredAt: new Date().toISOString(),
      entityType: "setting",
      entityId: event.key,
      actorId: event.updatedBy,
      payload: { category: event.category },
    });
  });

  bus.subscribe("permission.changed", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "permission.changed",
      occurredAt: new Date().toISOString(),
      entityType: "user",
      entityId: event.userId,
      actorId: null,
      payload: { scope: event.scope, action: event.action },
    });
  });

  bus.subscribe("delivery.zone.created", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "delivery.zone.created",
      occurredAt: new Date().toISOString(),
      entityType: "delivery_zone",
      entityId: event.zone.id,
      actorId: null,
      payload: { name: event.zone.name, cityId: event.zone.cityId },
    });
  });

  bus.subscribe("delivery.zone.updated", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "delivery.zone.updated",
      occurredAt: new Date().toISOString(),
      entityType: "delivery_zone",
      entityId: event.zone.id,
      actorId: null,
      payload: { name: event.zone.name, isActive: event.zone.isActive },
    });
  });

  bus.subscribe("delivery.store.created", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "delivery.store.created",
      occurredAt: new Date().toISOString(),
      entityType: "store",
      entityId: event.store.id,
      actorId: null,
      payload: { name: event.store.name, cityId: event.store.cityId },
    });
  });

  bus.subscribe("delivery.store.updated", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "delivery.store.updated",
      occurredAt: new Date().toISOString(),
      entityType: "store",
      entityId: event.store.id,
      actorId: null,
      payload: { name: event.store.name, isActive: event.store.isActive },
    });
  });

  bus.subscribe("delivery.zone.deactivated", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "delivery.zone.deactivated",
      occurredAt: new Date().toISOString(),
      entityType: "delivery_zone",
      entityId: event.zoneId,
      actorId: null,
      payload: {},
    });
  });

  bus.subscribe("delivery.tariff.created", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "delivery.tariff.created",
      occurredAt: new Date().toISOString(),
      entityType: "delivery_tariff",
      entityId: event.tariff.id,
      actorId: null,
      payload: { name: event.tariff.name, tariffType: event.tariff.tariffType },
    });
  });

  bus.subscribe("delivery.tariff.updated", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "delivery.tariff.updated",
      occurredAt: new Date().toISOString(),
      entityType: "delivery_tariff",
      entityId: event.tariff.id,
      actorId: null,
      payload: { name: event.tariff.name, isActive: event.tariff.isActive },
    });
  });

  bus.subscribe("ownership.transfer.initiated", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "ownership.transfer.initiated",
      occurredAt: new Date().toISOString(),
      entityType: "ownership_transfer",
      entityId: event.transfer.id,
      actorId: event.transfer.initiatorUserId,
      payload: {
        targetUserId: event.transfer.targetUserId,
        fullHandover: event.transfer.fullHandover,
      },
    });
  });

  bus.subscribe("ownership.transfer.accepted", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "ownership.transfer.accepted",
      occurredAt: new Date().toISOString(),
      entityType: "ownership_transfer",
      entityId: event.transfer.id,
      actorId: event.transfer.targetUserId,
      payload: { initiatorUserId: event.transfer.initiatorUserId },
    });
  });

  bus.subscribe("ownership.transfer.completed", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "ownership.transfer.completed",
      occurredAt: new Date().toISOString(),
      entityType: "ownership_transfer",
      entityId: event.transfer.id,
      actorId: event.transfer.targetUserId,
      payload: {
        initiatorUserId: event.transfer.initiatorUserId,
        fullHandover: event.transfer.fullHandover,
      },
    });
  });

  bus.subscribe("ownership.transfer.cancelled", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "ownership.transfer.cancelled",
      occurredAt: new Date().toISOString(),
      entityType: "ownership_transfer",
      entityId: event.transfer.id,
      actorId: null,
      payload: {
        initiatorUserId: event.transfer.initiatorUserId,
        targetUserId: event.transfer.targetUserId,
      },
    });
  });

  bus.subscribe("courier.created", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "courier.created",
      occurredAt: new Date().toISOString(),
      entityType: "courier",
      entityId: event.userId,
      actorId: null,
      payload: {},
    });
  });

  bus.subscribe("courier.blocked", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "courier.blocked",
      occurredAt: new Date().toISOString(),
      entityType: "courier",
      entityId: event.userId,
      actorId: null,
      payload: {},
    });
  });

  bus.subscribe("courier.unblocked", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "courier.unblocked",
      occurredAt: new Date().toISOString(),
      entityType: "courier",
      entityId: event.userId,
      actorId: null,
      payload: {},
    });
  });

  bus.subscribe("rbac.role.created", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "rbac.role.created",
      occurredAt: new Date().toISOString(),
      entityType: "rbac_role",
      entityId: event.roleId,
      actorId: null,
      payload: { name: event.name },
    });
  });

  bus.subscribe("rbac.role.updated", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "rbac.role.updated",
      occurredAt: new Date().toISOString(),
      entityType: "rbac_role",
      entityId: event.roleId,
      actorId: null,
      payload: { name: event.name },
    });
  });

  bus.subscribe("rbac.role.deleted", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "rbac.role.deleted",
      occurredAt: new Date().toISOString(),
      entityType: "rbac_role",
      entityId: event.roleId,
      actorId: null,
      payload: { name: event.name },
    });
  });

  bus.subscribe("rbac.permission.created", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "rbac.permission.created",
      occurredAt: new Date().toISOString(),
      entityType: "rbac_permission",
      entityId: event.permissionId,
      actorId: null,
      payload: { module: event.module, action: event.action },
    });
  });

  bus.subscribe("rbac.permission.updated", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "rbac.permission.updated",
      occurredAt: new Date().toISOString(),
      entityType: "rbac_permission",
      entityId: event.permissionId,
      actorId: null,
      payload: { module: event.module, action: event.action },
    });
  });

  bus.subscribe("rbac.permission.deleted", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "rbac.permission.deleted",
      occurredAt: new Date().toISOString(),
      entityType: "rbac_permission",
      entityId: event.permissionId,
      actorId: null,
      payload: { module: event.module, action: event.action },
    });
  });

  bus.subscribe("rbac.role.assigned", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "rbac.role.assigned",
      occurredAt: new Date().toISOString(),
      entityType: "user",
      entityId: event.userId,
      actorId: null,
      payload: { roleId: event.roleId },
    });
  });

  bus.subscribe("rbac.role.revoked", async (event) => {
    await auditLog.append({
      id: randomUUID(),
      action: "rbac.role.revoked",
      occurredAt: new Date().toISOString(),
      entityType: "user",
      entityId: event.userId,
      actorId: null,
      payload: { roleId: event.roleId },
    });
  });
}
