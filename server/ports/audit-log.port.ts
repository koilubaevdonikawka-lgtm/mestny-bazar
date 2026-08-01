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
  | "role.revoked";

export interface AuditRecord {
  id: string;
  action: AuditAction;
  occurredAt: string;
  entityType: string;
  entityId: string;
  actorId: string | null;
  payload: Record<string, unknown>;
}

export interface IAuditLog {
  append(record: AuditRecord): Promise<void>;
}
