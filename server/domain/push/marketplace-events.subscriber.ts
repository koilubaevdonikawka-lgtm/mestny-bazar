import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import type { IPushNotifier } from "@server/ports/push-notifier.port";
import type { OrderDTO } from "@shared/contracts/order";

function orderData(order: OrderDTO): Record<string, string> {
  return { orderId: order.id, orderNumber: String(order.orderNumber), status: order.status };
}

/**
 * Задача №215 — buyer-facing push on order status milestones. Subscribes
 * directly to the marketplace event bus (the same integration point as
 * subscribeAuditLog, @server/domain/audit-log), not through
 * INotificationProvider/NotificationCenter — see push-notifier.port.ts for
 * why: that pipeline is a fixed-chat-id operational broadcast (admin/
 * warehouse/courier via Telegram — itself still unimplemented, StubNotificationAdapter
 * only logs), with no concept of "which buyer's device". An order with
 * `userId: null` (guest ONLINE checkout, 20260716100000_guest_checkout_nullable_user.sql)
 * is silently skipped — there is no device_tokens row to look up.
 *
 * Event selection (approved, Задача №215) — the milestones an actual buyer
 * cares about tracking after placing an order: confirmed, courier assigned,
 * out for delivery, delivered, cancelled. Deliberately excludes
 * order.created (the buyer just placed it, they know), the internal
 * assembling_started/ready_for_delivery/arrived/paid steps, and
 * courier.status_changed/payment.* — too granular for a push, would read as
 * spam.
 */
export function subscribePushNotifications(bus: IMarketplaceEventBus, push: IPushNotifier): void {
  const notify = async (order: OrderDTO, title: string, body: string): Promise<void> => {
    if (!order.userId) return;
    await push.sendToUser(order.userId, { title, body, data: orderData(order) });
  };

  bus.subscribe("order.confirmed", async ({ order }) => {
    await notify(order, "Заказ подтверждён", `Заказ №${order.orderNumber} принят в обработку`);
  });

  bus.subscribe("courier.assigned", async ({ order }) => {
    await notify(
      order,
      "Курьер назначен",
      `Курьер уже готовится к доставке заказа №${order.orderNumber}`,
    );
  });

  bus.subscribe("order.out_for_delivery", async ({ order }) => {
    await notify(
      order,
      "Курьер в пути",
      `Курьер везёт заказ №${order.orderNumber} — скоро будет у вас`,
    );
  });

  bus.subscribe("order.delivered", async ({ order }) => {
    await notify(
      order,
      "Заказ доставлен",
      `Заказ №${order.orderNumber} доставлен. Спасибо за покупку!`,
    );
  });

  bus.subscribe("order.cancelled", async ({ order }) => {
    await notify(order, "Заказ отменён", `Заказ №${order.orderNumber} отменён`);
  });
}
