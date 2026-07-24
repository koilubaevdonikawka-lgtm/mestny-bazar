import type {
  NotificationTemplate,
  OrderNotificationContext,
} from "@server/infrastructure/telegram/templates/notification-template";

/** Template for failed payment attempts. */
export class PaymentFailedTemplate implements NotificationTemplate {
  readonly templateId = "order.payment_failed";

  render(context: OrderNotificationContext): string {
    const amount = formatAmount(context.totalAmount, context.currency);
    return [
      "⚠️ <b>Оплата не прошла</b>",
      `Номер: <code>${escapeHtml(context.orderNumber)}</code>`,
      amount ? `Сумма: ${amount}` : null,
      "Попросите клиента повторить оплату или выберите другой способ.",
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
