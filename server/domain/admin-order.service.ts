import type { IOrderRepository } from "@server/ports/order.repository";
import type { IOrderLifecyclePolicy } from "@server/ports/order-lifecycle.port";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import type { OrderDTO, OrderListParams, OrderListResult } from "@shared/contracts/order";
import { OrderStatus } from "@shared/contracts/order";
import type { UserRole } from "@shared/contracts/user";
import { OrderNotFoundError } from "@server/domain/orders.errors";
import { InventoryService } from "@server/domain/inventory.service";
import { VariantStockService } from "@server/domain/variant-stock.service";
import { OrderLifecycleCascadeService } from "@server/domain/order-lifecycle-cascade.service";
import { logger } from "@shared/observability/logger";

export interface AdminActor {
  id: string;
  roles: UserRole[];
}

export class AdminOrderService {
  constructor(
    private readonly orders: IOrderRepository,
    private readonly orderLifecycle: IOrderLifecyclePolicy,
    private readonly cascade: OrderLifecycleCascadeService,
    private readonly inventory: InventoryService,
    private readonly events: IMarketplaceEventBus,
    /** Stage 21 — same release-on-cancel step as `inventory`, extended to variant stock. Not modified, only composed here. */
    private readonly variantStock: VariantStockService,
  ) {}

  async listOrders(params?: OrderListParams): Promise<OrderListResult> {
    const result = await this.orders.listAll(params);
    await this.cascade.sweep(result.items);
    return result;
  }

  /** Paginated order history for a specific courier — Couriers admin detail card (Промпт №068). */
  async listOrdersByCourier(courierId: string, params?: OrderListParams): Promise<OrderListResult> {
    const result = await this.orders.listByCourier(courierId, params);
    await this.cascade.sweep(result.items);
    return result;
  }

  async getOrder(id: string): Promise<OrderDTO> {
    const order = await this.orders.getById(id);
    if (!order) throw new OrderNotFoundError();
    await this.cascade.sweep([order]);
    return order;
  }

  async confirmOrder(orderId: string, actor: AdminActor): Promise<OrderDTO> {
    const order = await this.transitionOrder(
      orderId,
      OrderStatus.CONFIRMED,
      "admin_confirm",
      actor,
    );
    await this.events.publish({ type: "order.confirmed", order });
    return order;
  }

  async cancelOrder(orderId: string, actor: AdminActor): Promise<OrderDTO> {
    const cancelled = await this.transitionOrder(
      orderId,
      OrderStatus.CANCELLED,
      "admin_cancel",
      actor,
    );

    // Same best-effort compensation OrderService.cancelOrder() already applies
    // to the customer self-cancel path — the order is already cancelled
    // (durable) at this point, a release hiccup must not undo that.
    const stockItems = cancelled.items
      .filter((item): item is typeof item & { productId: string } => item.productId !== null)
      .map((item) => ({ productId: item.productId, quantity: item.quantity }));

    if (stockItems.length > 0) {
      await this.inventory.releaseStock(stockItems).catch(() => {
        logger.error("Failed to release reserved stock after an admin order cancellation", {
          orderId,
        });
      });
    }

    // Stage 21 — same compensation, same principle, for variant stock. Only
    // items ordered with a variantId participate; an order with none
    // produces an empty array and variantStock.releaseStock is never called
    // — identical to the pre-Stage-21 behavior.
    const variantStockItems = cancelled.items
      .filter((item): item is typeof item & { variantId: string } => item.variantId !== null)
      .map((item) => ({ variantId: item.variantId, quantity: item.quantity }));

    if (variantStockItems.length > 0) {
      await this.variantStock.releaseStock(variantStockItems).catch(() => {
        logger.error("Failed to release reserved variant stock after an admin order cancellation", {
          orderId,
        });
      });
    }

    await this.events.publish({
      type: "order.cancelled",
      order: cancelled,
      reason: "admin_cancel",
    });
    return cancelled;
  }

  private async transitionOrder(
    orderId: string,
    targetStatus: OrderDTO["status"],
    reason: string,
    actor: AdminActor,
  ): Promise<OrderDTO> {
    const order = await this.getOrder(orderId);

    this.orderLifecycle.assertCanTransition({
      orderId,
      currentStatus: order.status,
      targetStatus,
      actor: { id: actor.id, roles: actor.roles },
      reason,
    });

    return this.orders.updateStatus(orderId, order.status, targetStatus);
  }
}
