import type {
  NotificationTemplate,
  OrderNotificationContext,
} from "@server/infrastructure/telegram/templates/notification-template";

/** Template for orders ready for pickup or delivery. */
export class OrderReadyTemplate implements NotificationTemplate {
  readonly templateId = "order.ready";

  render(context: OrderNotificationContext): string {
    return [
      "📦 <b>Заказ готов</b>",
      `Номер: <code>${escapeHtml(context.orderNumber)}</code>`,
      context.customerName ? `Клиент: ${escapeHtml(context.customerName)}` : null,
      "Можно передавать курьеру или выдавать покупателю.",
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
