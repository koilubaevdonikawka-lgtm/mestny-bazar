import type { IAuditLog, AuditRecord, AuditAction } from "@server/ports/audit-log.port";
import type { IProfileRepository } from "@server/ports/profile.repository";
import type { IProductRepository } from "@server/ports/product.repository";
import type { ISupplierRepository } from "@server/ports/supplier.repository";
import type { IAdminDeliveryZoneRepository } from "@server/ports/delivery-zone-admin.repository";
import type {
  AuditLogEntryDTO,
  AuditLogListParams,
  AuditLogListResult,
  AuditLogPayloadValue,
} from "@shared/contracts/audit-log";

/**
 * Entries where a real actor id is never recorded (Задача №199 research —
 * see audit-log-humanization.md) because the action is automated: a cron
 * sweep, a payment-provider webhook, or a derived side-effect of a stock
 * mutation — never a dropped-through admin actor. Anything else with a
 * null actorId genuinely has no recorded actor (actorKind "unknown"), not
 * "the system" — conflating the two would misattribute real admin actions.
 */
const SYSTEM_ACTIONS = new Set<AuditAction>([
  "order.operational_cascade_started",
  "order.paid",
  "payment.confirmed",
  "payment.failed",
  "payment.expired",
  "stock.low",
  "stock.depleted",
]);

/** Entity types keyed by a profiles-table user id, resolved uniformly by name. */
const USER_KEYED_ENTITY_TYPES = new Set(["customer", "seller", "courier", "user"]);

function pickStringField(
  payload: Record<string, AuditLogPayloadValue>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.length > 0) return value;
  }
  return null;
}

/**
 * logs.md — read-only query surface over IAuditLog for the admin "Журналы
 * событий" screen. Задача №199 — beyond a pass-through, this also resolves
 * each entry's entityId/actorId into a human-readable name (or a typed
 * "why not" reason for the client to render), so the UI never has to show a
 * bare UUID. Payload fields set at write time are the fast path (no extra
 * DB round trip) for entity types whose action already carries the name
 * (category/coupon/banner/store/delivery_tariff/rbac_role); the remaining
 * gaps (product for stock.* actions, a deactivated delivery_zone, a supply's
 * supplier name, a payout's seller name, an ownership_transfer's other
 * party) fall through to a live repository lookup.
 */
export class AuditLogQueryService {
  constructor(
    private readonly auditLog: IAuditLog,
    private readonly profiles: IProfileRepository,
    private readonly products: IProductRepository,
    private readonly suppliers: ISupplierRepository,
    private readonly deliveryZones: IAdminDeliveryZoneRepository,
  ) {}

  async list(params: AuditLogListParams): Promise<AuditLogListResult> {
    const result = await this.auditLog.list(params);
    const items = await Promise.all(result.items.map((entry) => this.humanize(entry)));
    return { ...result, items };
  }

  private async humanize(entry: AuditRecord): Promise<AuditLogEntryDTO> {
    const [entityName, actor] = await Promise.all([
      this.resolveEntityName(entry),
      this.resolveActor(entry),
    ]);
    return { ...entry, entityName, actorName: actor.actorName, actorKind: actor.actorKind };
  }

  private async resolveEntityName(entry: AuditRecord): Promise<string | null> {
    const payload = entry.payload;

    if (entry.entityType === "order") {
      const orderNumber = payload.orderNumber;
      return typeof orderNumber === "number" || typeof orderNumber === "string"
        ? String(orderNumber)
        : null;
    }
    if (entry.entityType === "setting") {
      // The audit entry's entityId IS the settings key (e.g. "checkout_source") — already human-readable, not a UUID.
      return entry.entityId;
    }
    if (entry.entityType === "rbac_permission") {
      const module = payload.module;
      const action = payload.action;
      return typeof module === "string" && typeof action === "string"
        ? `${module}.${action}`
        : null;
    }
    if (entry.entityType === "supply") {
      const supplierId = payload.supplierId;
      if (typeof supplierId !== "string") return null;
      const supplier = await this.suppliers.getById(supplierId);
      return supplier?.name ?? null;
    }
    if (entry.entityType === "payout") {
      const sellerId = payload.sellerId;
      if (typeof sellerId !== "string") return null;
      const profile = await this.profiles.getById(sellerId);
      return profile?.fullName ?? null;
    }
    if (entry.entityType === "ownership_transfer") {
      const otherUserId = payload.targetUserId ?? payload.initiatorUserId;
      if (typeof otherUserId !== "string") return null;
      const profile = await this.profiles.getById(otherUserId);
      return profile?.fullName ?? null;
    }
    if (USER_KEYED_ENTITY_TYPES.has(entry.entityType)) {
      const profile = await this.profiles.getById(entry.entityId);
      return profile?.fullName ?? null;
    }

    // Fast path: category/coupon/banner/store/delivery_tariff/rbac_role, and
    // delivery_zone's created/updated actions all carry the name at write time.
    const fromPayload = pickStringField(payload, ["name", "title", "code"]);
    if (fromPayload) return fromPayload;

    // Remaining gaps — live lookup by entityId.
    if (entry.entityType === "product") {
      const product = await this.products.getById(entry.entityId);
      return product?.name ?? null;
    }
    if (entry.entityType === "delivery_zone") {
      const zone = await this.deliveryZones.getById(entry.entityId);
      return zone?.name ?? null;
    }
    return null;
  }

  private async resolveActor(
    entry: AuditRecord,
  ): Promise<{ actorName: string | null; actorKind: AuditLogEntryDTO["actorKind"] }> {
    if (entry.actorId) {
      const profile = await this.profiles.getById(entry.actorId);
      if (profile?.fullName) return { actorName: profile.fullName, actorKind: "resolved" };
      return { actorName: null, actorKind: "unresolved" };
    }
    if (SYSTEM_ACTIONS.has(entry.action)) {
      return { actorName: null, actorKind: "system" };
    }
    return { actorName: null, actorKind: "unknown" };
  }
}
