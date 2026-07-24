import type { SendOrderNotificationDto } from "@server/application/modules/notification/notification/dto";

export function buildOrderCreatedMessage(dto: SendOrderNotificationDto): string {
  const orderNumber = dto.orderNumber ?? dto.orderId;
  const amount = formatAmount(dto.totalAmount, dto.currency);
  return [
    "🛒 <b>Новый заказ</b>",
    `Номер: <code>${escapeHtml(orderNumber)}</code>`,
    dto.customerName ? `Клиент: ${escapeHtml(dto.customerName)}` : null,
    amount ? `Сумма: ${amount}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildPaymentSucceededMessage(dto: SendOrderNotificationDto): string {
  const orderNumber = dto.orderNumber ?? dto.orderId;
  const amount = formatAmount(dto.totalAmount, dto.currency);
  return [
    "✅ <b>Заказ оплачен</b>",
    `Номер: <code>${escapeHtml(orderNumber)}</code>`,
    amount ? `Сумма: ${amount}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildPaymentFailedMessage(dto: SendOrderNotificationDto): string {
  const orderNumber = dto.orderNumber ?? dto.orderId;
  const amount = formatAmount(dto.totalAmount, dto.currency);
  return [
    "⚠️ <b>Оплата не прошла</b>",
    `Номер: <code>${escapeHtml(orderNumber)}</code>`,
    amount ? `Сумма: ${amount}` : null,
    "Попросите клиента повторить оплату или выберите другой способ.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildOrderStatusChangedMessage(dto: SendOrderNotificationDto): string {
  const orderNumber = dto.orderNumber ?? dto.orderId;
  return [
    "📦 <b>Статус заказа изменён</b>",
    `Номер: <code>${escapeHtml(orderNumber)}</code>`,
    dto.status ? `Статус: ${escapeHtml(dto.status)}` : null,
  ]
    .filter(Boolean)
    .join("\n");
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
