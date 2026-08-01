import type { IOrderRepository } from "@server/ports/order.repository";
import type { IOrderLifecyclePolicy } from "@server/ports/order-lifecycle.port";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import type { OrderDTO, OrderListParams, OrderListResult } from "@shared/contracts/order";
import { OrderStatus } from "@shared/contracts/order";
import type { UserRole } from "@shared/contracts/user";
import { OrderNotFoundError } from "@server/domain/orders.errors";
import { InventoryService } from "@server/domain/inventory.service";
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
  ) {}

  async listOrders(params?: OrderListParams): Promise<OrderListResult> {
    const result = await this.orders.listAll(params);
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
