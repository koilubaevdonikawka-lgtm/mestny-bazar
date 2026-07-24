import type {
  NotificationTemplate,
  OrderNotificationContext,
} from "@server/infrastructure/telegram/templates/notification-template";

/** Template for successfully paid orders. */
export class OrderPaidTemplate implements NotificationTemplate {
  readonly templateId = "order.paid";

  render(context: OrderNotificationContext): string {
    const amount = formatAmount(context.totalAmount, context.currency);
    return [
      "✅ <b>Заказ оплачен</b>",
      `Номер: <code>${escapeHtml(context.orderNumber)}</code>`,
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
