import type { AuditLogPayloadValue } from "@shared/contracts/audit-log";

/** Marketplace actions recorded by the audit log. */
export type AuditAction =
  | "order.created"
  | "order.cancelled"
  | "order.operational_cascade_started"
  | "order.confirmed"
  | "order.assembling_started"
  | "order.ready_for_delivery"
  | "order.out_for_delivery"
  | "order.arrived"
  | "order.delivered"
  | "category.created"
  | "category.updated"
  | "stock.low"
  | "stock.depleted"
  | "stock.received"
  | "stock.returned"
  | "courier.assigned"
  | "courier.status_changed"
  | "customer.blocked"
  | "customer.unblocked"
  | "seller.registered"
  | "seller.verified"
  | "seller.rejected"
  | "supply.requested"
  | "supply.received"
  | "role.assigned"
  | "role.revoked"
  | "coupon.created"
  | "coupon.redeemed"
  | "payout.created"
  | "payout.completed"
  | "content.published"
  | "product.published"
  | "stock.adjusted"
  | "settings.changed"
  | "permission.changed"
  | "delivery.zone.created"
  | "delivery.zone.updated"
  | "delivery.store.created"
  | "delivery.store.updated"
  | "delivery.zone.deactivated"
  | "delivery.tariff.created"
  | "delivery.tariff.updated"
  | "ownership.transfer.initiated"
  | "ownership.transfer.accepted"
  | "ownership.transfer.completed"
  | "ownership.transfer.cancelled"
  | "courier.created"
  | "courier.blocked"
  | "courier.unblocked"
  | "rbac.role.created"
  | "rbac.role.updated"
  | "rbac.role.deleted"
  | "rbac.permission.created"
  | "rbac.permission.updated"
  | "rbac.permission.deleted"
  | "rbac.role.assigned"
  | "rbac.role.revoked"
  | "order.paid"
  | "payment.initiated"
  | "payment.confirmed"
  | "payment.failed"
  | "payment.expired";

export interface AuditRecord {
  id: string;
  action: AuditAction;
  occurredAt: string;
  entityType: string;
  entityId: string;
  actorId: string | null;
  payload: Record<string, AuditLogPayloadValue>;
}

export interface AuditRecordListParams {
  action?: string;
  entityType?: string;
  entityId?: string;
  actorId?: string;
  periodStart?: string;
  periodEnd?: string;
  page?: number;
  pageSize?: number;
}

export interface AuditRecordListResult {
  items: AuditRecord[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface IAuditLog {
  append(record: AuditRecord): Promise<void>;
  /** logs.md — filterable, paginated read path for the "Лента событий" screen. */
  list(params: AuditRecordListParams): Promise<AuditRecordListResult>;
}
