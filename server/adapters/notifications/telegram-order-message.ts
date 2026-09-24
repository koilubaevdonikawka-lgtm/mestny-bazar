import type { OrderDTO, PaymentMethod } from "@shared/contracts/order";
import {
  formatMoney,
  formatOrderDate,
  formatOrderStatus,
  formatPaymentStatus,
} from "@shared/lib/order-display";

/** Workers run in UTC — the admins reading this are in Kyrgyzstan. */
const ORDER_TIME_ZONE = "Asia/Bishkek";

/** Telegram Bot API sendMessage hard limit on `text` length. */
export const TELEGRAM_MESSAGE_MAX_LENGTH = 4096;

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  ONLINE: "Онлайн",
  CASH: "Наличными при получении",
};

/**
 * Plain-text (no parse_mode) new-order summary for Telegram — plain text so
 * customer-entered fields (address, notes, product names) need no escaping
 * and can never break Markdown/HTML parsing and fail the whole send.
 * `headline` is the role-specific line IOrderEventNotifier already builds
 * (it carries the order number).
 */
export function formatTelegramOrderMessage(order: OrderDTO, headline: string): string {
  const money = (amount: number) => formatMoney(amount, order.currency);

  const itemLines = order.items.map(
    (item, index) =>
      `${index + 1}. ${item.productName} — ${item.quantity} × ${money(item.unitPrice)} = ${money(item.lineTotal)}`,
  );

  const totals = [`Товары: ${money(order.subtotal)}`, `Доставка: ${money(order.deliveryFee)}`];
  if (order.discountAmount > 0) {
    const coupon = order.couponCode ? ` (${order.couponCode})` : "";
    totals.push(`Скидка: −${money(order.discountAmount)}${coupon}`);
  }
  totals.push(`Итого: ${money(order.total)}`);

  const payment =
    order.paymentMethod === "ONLINE"
      ? `${PAYMENT_METHOD_LABELS.ONLINE} (${formatPaymentStatus(order.paymentStatus)})`
      : PAYMENT_METHOD_LABELS.CASH;

  const details = [
    `Оплата: ${payment}`,
    `Адрес: ${order.addressSnapshot}`,
    `Клиент: ${order.customerName}, ${order.customerPhone}`,
  ];
  if (order.notes) details.push(`Комментарий: ${order.notes}`);

  const text = [
    headline,
    `${formatOrderDate(order.createdAt, ORDER_TIME_ZONE)} · ${formatOrderStatus(order.status)}`,
    "",
    "Состав заказа:",
    ...itemLines,
    "",
    ...totals,
    "",
    ...details,
  ].join("\n");

  return text.length > TELEGRAM_MESSAGE_MAX_LENGTH
    ? `${text.slice(0, TELEGRAM_MESSAGE_MAX_LENGTH - 1)}…`
    : text;
}
