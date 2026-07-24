import type {
  NotificationTemplate,
  OrderNotificationContext,
} from "@server/infrastructure/telegram/templates/notification-template";

/** Template for cancelled orders. */
export class OrderCancelledTemplate implements NotificationTemplate {
  readonly templateId = "order.cancelled";

  render(context: OrderNotificationContext): string {
    return [
      "❌ <b>Заказ отменён</b>",
      `Номер: <code>${escapeHtml(context.orderNumber)}</code>`,
      context.status ? `Статус: ${escapeHtml(context.status)}` : null,
    ]
      .filter(Boolean)
      .join("\n");
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
