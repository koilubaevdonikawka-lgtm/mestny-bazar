import type {
  NotificationTemplate,
  OrderNotificationContext,
} from "@server/infrastructure/telegram/templates/notification-template";

/** Template for newly created orders. */
export class OrderCreatedTemplate implements NotificationTemplate {
  readonly templateId = "order.created";

  render(context: OrderNotificationContext): string {
    const amount = formatAmount(context.totalAmount, context.currency);
    return [
      "🛒 <b>Новый заказ</b>",
      `Номер: <code>${escapeHtml(context.orderNumber)}</code>`,
      context.customerName ? `Клиент: ${escapeHtml(context.customerName)}` : null,
      amount ? `Сумма: ${amount}` : null,
    ]
      .filter(Boolean)
      .join("\n");
  }
}

function formatAmount(amount?: number, currency?: string): string | null {
  if (amount === undefined) {
    return null;
  }
  return `${amount.toFixed(2)} ${currency ?? "KGS"}`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export type { OrderNotificationContext };
