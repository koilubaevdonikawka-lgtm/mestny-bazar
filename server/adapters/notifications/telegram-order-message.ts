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

/**
 * Room kept free in every part for the "Заказ №… — часть N/M" line added once
 * the number of parts is known (≈30 characters even for huge numbers). The
 * messages are plain text (no parse_mode), so nothing gets escaped/expanded on
 * the way — JS string length (UTF-16 units, emoji = 2) is what Telegram counts
 * or more, so a part measured here never grows past the limit when sent.
 */
const PART_HEADER_RESERVE = 64;
const PART_BODY_LIMIT = TELEGRAM_MESSAGE_MAX_LENGTH - PART_HEADER_RESERVE;

const ITEM_INDENT = "    ";
const CONTINUATION_HEADER = "Состав заказа (продолжение):";
/** Largest single block: it must still fit in a continuation part, after its header line. */
const UNIT_LIMIT = PART_BODY_LIMIT - CONTINUATION_HEADER.length - 1;

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  ONLINE: "Онлайн",
  CASH: "Наличными при получении",
};

/**
 * products.description (the same text shown on the product card), flattened
 * to one line so it stays visually attached to its item. Missing/blank gives
 * null — the line is simply omitted, never a "нет описания" placeholder.
 * Never shortened: a long one is carried over to continuation lines below.
 */
function formatDescription(description: string | null | undefined): string | null {
  const flat = description?.replace(/\s+/g, " ").trim();
  return flat || null;
}

/**
 * Breaks one over-long line into pieces of at most `limit` characters, at the
 * last space before the limit where there is one (a hard cut only for a single
 * "word" longer than the limit). Continuation pieces are indented. No text is
 * ever dropped or replaced by "…".
 */
function wrapLongLine(line: string, limit: number): string[] {
  if (line.length <= limit) return [line];
  const pieces: string[] = [];
  let rest = line;
  let prefix = "";
  while (prefix.length + rest.length > limit) {
    const room = limit - prefix.length;
    const space = rest.lastIndexOf(" ", room);
    const cut = space > 0 ? space : room;
    pieces.push(prefix + rest.slice(0, cut));
    rest = rest.slice(cut).trimStart();
    prefix = ITEM_INDENT;
  }
  if (rest) pieces.push(prefix + rest);
  return pieces;
}

/**
 * A block of lines that must stay in one message (an item with its
 * description, the contacts block). Only a block that alone exceeds a whole
 * part is split — by lines, then an over-long line by words.
 */
function toUnits(lines: string[]): string[] {
  const block = lines.join("\n");
  if (block.length <= UNIT_LIMIT) return [block];
  return lines.flatMap((line) => wrapLongLine(line, UNIT_LIMIT));
}

/**
 * New-order notification for Telegram, as one or more plain-text messages
 * (no parse_mode — customer-entered fields need no escaping and can never
 * break Markdown/HTML parsing and fail the whole send).
 *
 * The first message always starts with everything needed to deliver: order
 * number and time, customer name, phone, address, comment, payment method,
 * totals and the number of items — then the item list. A list that doesn't fit
 * continues in further messages, split only between items, each headed
 * "Заказ №… — часть N/M". Nothing is ever truncated.
 *
 * `headline` is the role-specific line IOrderEventNotifier already builds
 * (it carries the order number).
 */
export function formatTelegramOrderMessages(order: OrderDTO, headline: string): string[] {
  const money = (amount: number) => formatMoney(amount, order.currency);

  const payment =
    order.paymentMethod === "ONLINE"
      ? `${PAYMENT_METHOD_LABELS.ONLINE} (${formatPaymentStatus(order.paymentStatus)})`
      : PAYMENT_METHOD_LABELS.CASH;

  const head = [
    headline,
    `${formatOrderDate(order.createdAt, ORDER_TIME_ZONE)} · ${formatOrderStatus(order.status)}`,
    `Клиент: ${order.customerName}`,
    `Телефон: ${order.customerPhone}`,
    `Адрес: ${order.addressSnapshot}`,
  ];
  if (order.notes) head.push(`Комментарий: ${order.notes}`);
  head.push(`Оплата: ${payment}`);
  head.push(`Товары: ${money(order.subtotal)}`, `Доставка: ${money(order.deliveryFee)}`);
  if (order.discountAmount > 0) {
    const coupon = order.couponCode ? ` (${order.couponCode})` : "";
    head.push(`Скидка: −${money(order.discountAmount)}${coupon}`);
  }
  head.push(`Итого: ${money(order.total)}`, `Позиций: ${order.items.length}`);

  const itemUnits = order.items.flatMap((item, index) => {
    const line = `${index + 1}. ${item.productName} — ${item.quantity} × ${money(item.unitPrice)} = ${money(item.lineTotal)}`;
    const description = formatDescription(item.productDescription);
    return toUnits(description ? [line, `${ITEM_INDENT}${description}`] : [line]);
  });

  const units = [...toUnits(head), "\nСостав заказа:", ...itemUnits];

  const bodies: string[] = [];
  let current = "";
  for (const unit of units) {
    const candidate = current ? `${current}\n${unit}` : unit;
    if (candidate.length <= PART_BODY_LIMIT) {
      current = candidate;
    } else {
      bodies.push(current);
      current = `${CONTINUATION_HEADER}\n${unit}`;
    }
  }
  if (current) bodies.push(current);

  if (bodies.length === 1) return bodies;
  return bodies.map(
    (body, index) => `Заказ №${order.orderNumber} — часть ${index + 1}/${bodies.length}\n${body}`,
  );
}
