import type { OrderDTO } from "@shared/contracts/order";
import type { AdminCategoryDTO } from "@shared/contracts/category-admin";
import type { SupplyDTO } from "@shared/contracts/supplier";
import type { CouponDTO } from "@shared/contracts/coupon";
import type { SellerPayoutDTO } from "@shared/contracts/payout";
import type { BannerDTO } from "@shared/contracts/banner";
import type { SellerProductDTO } from "@shared/contracts/seller-product";
import type { AdminScope } from "@shared/contracts/user-admin";
import type { DeliveryTariffDTO, DeliveryZoneDTO, StoreDTO } from "@shared/contracts/delivery";
import type { OwnershipTransferDTO } from "@shared/contracts/ownership-transfer";
import type { AggregatedAIJobResult, AIJob } from "@server/ports/marketplace-ai.port";
import type {
  CatalogAnalysisResult,
  CatalogProductInput,
} from "@server/ports/marketplace-ai/catalog-analysis.port";
import type {
  MediaAnalysisResult,
  MediaAssetInput,
} from "@server/ports/marketplace-ai/media-analysis.port";

/** Unified marketplace events routed through Marketplace Events. */
export type MarketplaceEvent =
  | { type: "order.created"; order: OrderDTO }
  | { type: "order.cancelled"; order: OrderDTO; reason: string }
  /** Webhook-confirmed online payment transitioned the order CREATED → PAID (Промпт №075). */
  | { type: "order.paid"; order: OrderDTO }
  | { type: "payment.initiated"; order: OrderDTO; paymentId: string }
  | { type: "payment.confirmed"; order: OrderDTO; paymentId: string }
  | { type: "payment.failed"; order: OrderDTO; paymentId: string; reason: string }
  | { type: "payment.expired"; order: OrderDTO; paymentId: string }
  /**
   * Fired once, idempotently, when an order's 2-minute cancellation buffer
   * has expired without the customer cancelling — the gate for the
   * operational cascade (docs/admin-platform/platform-lifecycle.md, §3).
   * Not the same as order.created: subscribers that act on staff-facing
   * consequences of a new order (seller notification today; courier search,
   * seller domain — later stages) must react to THIS event, not
   * order.created directly.
   */
  | { type: "order.operational_cascade_started"; order: OrderDTO }
  | { type: "order.confirmed"; order: OrderDTO }
  | { type: "order.assembling_started"; order: OrderDTO }
  | { type: "order.ready_for_delivery"; order: OrderDTO }
  | { type: "order.out_for_delivery"; order: OrderDTO }
  | { type: "order.arrived"; order: OrderDTO }
  | { type: "order.delivered"; order: OrderDTO }
  | { type: "category.created"; category: AdminCategoryDTO }
  | { type: "category.updated"; category: AdminCategoryDTO }
  | { type: "stock.low"; productId: string; stock: number; threshold: number }
  | { type: "stock.depleted"; productId: string }
  /** Движение товара (Промпт №4) — журнал ведётся через существующий audit_log, не новую сущность. */
  | {
      type: "stock.received";
      productId: string;
      quantity: number;
      actorId: string;
      movementDate: string;
      purchasePrice: number | null;
      supplierId: string | null;
    }
  | {
      type: "stock.returned";
      productId: string;
      quantity: number;
      actorId: string;
      movementDate: string;
      note: string | null;
    }
  | { type: "courier.assigned"; order: OrderDTO; courierId: string }
  | { type: "courier.status_changed"; courierId: string; isAvailable: boolean }
  | { type: "customer.blocked"; userId: string }
  | { type: "customer.unblocked"; userId: string }
  | { type: "role.assigned"; userId: string; role: string }
  | { type: "role.revoked"; userId: string; role: string }
  | { type: "seller.registered"; userId: string }
  | { type: "seller.verified"; userId: string }
  | { type: "seller.rejected"; userId: string }
  | { type: "supply.requested"; supply: SupplyDTO }
  | { type: "supply.received"; supply: SupplyDTO }
  | { type: "coupon.created"; coupon: CouponDTO }
  | { type: "coupon.redeemed"; coupon: CouponDTO }
  | { type: "payout.created"; payout: SellerPayoutDTO }
  | { type: "payout.completed"; payout: SellerPayoutDTO }
  | { type: "content.published"; banner: BannerDTO }
  /**
   * ai.md — the retargeted AI trigger (Этап 5): analysis runs when a seller
   * publishes a product, not on every order.created. Replaces the previous
   * order.created subscription in server/domain/marketplace-ai/marketplace-events.subscriber.ts.
   */
  /**
   * Промпт №103 — the single product-lifecycle event, regardless of whether
   * the product was created by a seller or an admin (SellerProductService is
   * now the one entry point for both). No separate admin product.created/
   * product.updated events — same trigger, same AI pipeline, same audit log.
   */
  | { type: "product.published"; product: SellerProductDTO }
  | { type: "stock.adjusted"; productId: string; stock: number }
  | { type: "settings.changed"; key: string; category: string; updatedBy: string }
  | {
      type: "permission.changed";
      userId: string;
      scope: AdminScope;
      action: "assigned" | "revoked";
    }
  | { type: "product.media.analysis.requested"; productId: string; photos: MediaAssetInput[] }
  | { type: "product.catalog.analysis.requested"; productId: string; product: CatalogProductInput }
  | { type: "ai.job.completed"; job: AIJob; result: AggregatedAIJobResult }
  | {
      type: "photo.analysis.completed";
      jobId: string;
      productId: string | null;
      result: MediaAnalysisResult;
    }
  | {
      type: "catalog.analysis.completed";
      jobId: string;
      productId: string | null;
      result: CatalogAnalysisResult;
    }
  /** docs/delivery/delivery-events.md */
  | { type: "delivery.zone.created"; zone: DeliveryZoneDTO }
  | { type: "delivery.zone.updated"; zone: DeliveryZoneDTO }
  | { type: "delivery.zone.deactivated"; zoneId: string }
  /** Подэтап 0 (delivery-future-roadmap.md) — Store origin-point CRUD. */
  | { type: "delivery.store.created"; store: StoreDTO }
  | { type: "delivery.store.updated"; store: StoreDTO }
  | { type: "delivery.tariff.created"; tariff: DeliveryTariffDTO }
  | { type: "delivery.tariff.updated"; tariff: DeliveryTariffDTO }
  | { type: "ownership.transfer.initiated"; transfer: OwnershipTransferDTO }
  | { type: "ownership.transfer.accepted"; transfer: OwnershipTransferDTO }
  | { type: "ownership.transfer.completed"; transfer: OwnershipTransferDTO }
  | { type: "ownership.transfer.cancelled"; transfer: OwnershipTransferDTO }
  /** Couriers admin rebuild (Промпт №068). */
  | { type: "courier.created"; userId: string }
  | { type: "courier.blocked"; userId: string }
  | { type: "courier.unblocked"; userId: string }
  /** Industrial RBAC (Промпт №068, "Права доступа") — additive, parallel to role.assigned/revoked above. */
  | { type: "rbac.role.created"; roleId: string; name: string }
  | { type: "rbac.role.updated"; roleId: string; name: string }
  | { type: "rbac.role.deleted"; roleId: string; name: string }
  | { type: "rbac.permission.created"; permissionId: string; module: string; action: string }
  | { type: "rbac.permission.updated"; permissionId: string; module: string; action: string }
  | { type: "rbac.permission.deleted"; permissionId: string; module: string; action: string }
  | { type: "rbac.role.assigned"; userId: string; roleId: string }
  | { type: "rbac.role.revoked"; userId: string; roleId: string };

export type MarketplaceEventType = MarketplaceEvent["type"];

export type MarketplaceEventHandler<T extends MarketplaceEventType = MarketplaceEventType> = (
  event: Extract<MarketplaceEvent, { type: T }>,
) => Promise<void>;

/** In-memory event bus contract — publish/subscribe only (no external brokers). */
export interface IMarketplaceEventBus {
  publish(event: MarketplaceEvent): Promise<void>;
  subscribe<T extends MarketplaceEventType>(
    eventType: T,
    handler: MarketplaceEventHandler<T>,
  ): void;
}
