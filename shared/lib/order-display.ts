import {
  OrderStatus,
  type OrderStatus as OrderStatusType,
  type PaymentStatus,
} from "@shared/contracts/order";

/** Canonical happy-path sequence for order timeline UI (uses domain OrderStatus only). */
export const ORDER_TIMELINE_SEQUENCE: readonly OrderStatusType[] = [
  OrderStatus.CREATED,
  OrderStatus.PAID,
  OrderStatus.CONFIRMED,
  OrderStatus.ASSEMBLING,
  OrderStatus.READY_FOR_DELIVERY,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.ARRIVED,
  OrderStatus.DELIVERED,
];

export type TimelineStepState = "completed" | "current" | "upcoming" | "cancelled";

export function getTimelineStepState(
  orderStatus: OrderStatusType,
  step: OrderStatusType,
): TimelineStepState {
  if (orderStatus === OrderStatus.CANCELLED) {
    return "cancelled";
  }
  const currentIndex = ORDER_TIMELINE_SEQUENCE.indexOf(orderStatus);
  const stepIndex = ORDER_TIMELINE_SEQUENCE.indexOf(step);
  if (currentIndex < 0 || stepIndex < 0) return "upcoming";
  if (stepIndex < currentIndex) return "completed";
  if (stepIndex === currentIndex) return "current";
  return "upcoming";
}

const ORDER_STATUS_LABELS: Record<OrderStatusType, string> = {
  CREATED: "Создан",
  PAID: "Оплачен",
  CONFIRMED: "Подтверждён",
  ASSEMBLING: "Собирается",
  READY_FOR_DELIVERY: "Готов к доставке",
  OUT_FOR_DELIVERY: "В пути",
  ARRIVED: "Курьер на месте",
  DELIVERED: "Доставлен",
  CANCELLED: "Отменён",
};

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: "Не оплачен",
  awaiting: "Ожидает оплаты",
  paid: "Оплачен",
  failed: "Ошибка оплаты",
  refunded: "Возврат",
};

export function formatOrderStatus(status: OrderStatusType): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}

/**
 * Задача №140 — computed on the fly from existing fields, no new DB column:
 * an order that was genuinely paid (Задача №137 confirmed payment_status
 * survives cancellation untouched — cancelOrder() never touches payment
 * state) but then cancelled has no refund mechanism anywhere in this
 * project (Finik has no refund endpoint) — this flag exists purely to make
 * that state visible to staff, not to trigger any automated action.
 */
export function orderRequiresRefund(order: {
  status: OrderStatusType;
  paymentStatus: PaymentStatus;
}): boolean {
  return order.status === OrderStatus.CANCELLED && order.paymentStatus === "paid";
}

export function formatPaymentStatus(status: PaymentStatus): string {
  return PAYMENT_STATUS_LABELS[status] ?? status;
}

export function formatOrderDate(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatMoney(amount: number, currency: string): string {
  return `${amount.toFixed(2)} ${currency}`;
}

/**
 * Задача №143 — order.customerPhone is stored without a leading "+"
 * (checkout validation only enforces length/non-empty, e.g. "996700000000"
 * — see order.schema.ts), which a `tel:` link needs to reliably dial with
 * the country code on mobile. Stored data itself is left untouched; this
 * only affects how the href is built.
 */
export function formatTelHref(phone: string): string {
  return `tel:${phone.startsWith("+") ? phone : `+${phone}`}`;
}

/**
 * Задача №146 — a bare street address (e.g. "1 микрорайон") can match a
 * same-named place in another country; appending the order's city (when
 * resolvable — see useZoneCityLookup, src/hooks/) and ", Кыргызстан"
 * disambiguates it for both map providers below. `city` comes from the
 * caller resolving order.zoneId -> DeliveryZoneDTO.cityId -> CityDTO.name;
 * this module has no access to that data itself. Missing city never blocks
 * the link — it just falls back to "<address>, Кыргызстан".
 */
function buildDisambiguatedAddressQuery(address: string, city?: string | null): string {
  return [address, city, "Кыргызстан"]
    .filter((part): part is string => !!part && part.trim().length > 0)
    .join(", ");
}

/**
 * Задача №143/№146 — no coordinates exist anywhere on OrderDTO
 * (addressSnapshot is a plain text string captured at checkout), so this
 * uses Yandex Maps' text-search URL format rather than a coordinate pin.
 */
export function yandexMapsSearchUrl(address: string, city?: string | null): string {
  return `https://yandex.ru/maps/?text=${encodeURIComponent(buildDisambiguatedAddressQuery(address, city))}`;
}

/**
 * Задача №146 — 2GIS's precise documented deep-link format wasn't verified
 * against their own API docs (out of scope here); this uses 2GIS's generic
 * public text-search URL on their Kyrgyzstan domain
 * (https://2gis.kg/search/<query>), the same fallback format the architect's
 * own task text names. Revisit if 2GIS publishes/requires a more specific
 * format.
 */
export function twoGisSearchUrl(address: string, city?: string | null): string {
  return `https://2gis.kg/search/${encodeURIComponent(buildDisambiguatedAddressQuery(address, city))}`;
}
