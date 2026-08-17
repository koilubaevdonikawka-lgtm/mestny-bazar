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
