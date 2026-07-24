import {
  OrderStatus,
  type OrderStatus as OrderStatusType,
  isTerminalOrderStatus,
} from "@server/application/modules/order/order/models";

const DELIVERY_ACTIVE_STATUSES = new Set<OrderStatusType>([
  OrderStatus.AssignedToCourier,
  OrderStatus.CourierAccepted,
  OrderStatus.OnTheWay,
  OrderStatus.Delivering,
  OrderStatus.Arrived,
]);

/** Allowed forward transitions for the full order lifecycle. */
const ALLOWED_TRANSITIONS: Readonly<Record<OrderStatusType, readonly OrderStatusType[]>> =
  Object.freeze({
    [OrderStatus.Draft]: Object.freeze([OrderStatus.PendingPayment, OrderStatus.Cancelled]),
    [OrderStatus.PendingPayment]: Object.freeze([
      OrderStatus.Paid,
      OrderStatus.PaymentFailed,
      OrderStatus.Cancelled,
    ]),
    [OrderStatus.PaymentFailed]: Object.freeze([OrderStatus.PendingPayment, OrderStatus.Cancelled]),
    [OrderStatus.Paid]: Object.freeze([OrderStatus.Preparing, OrderStatus.Cancelled]),
    [OrderStatus.Preparing]: Object.freeze([
      OrderStatus.ReadyForDelivery,
      OrderStatus.Cancelled,
    ]),
    [OrderStatus.ReadyForDelivery]: Object.freeze([
      OrderStatus.AssignedToCourier,
      OrderStatus.Cancelled,
    ]),
    [OrderStatus.AssignedToCourier]: Object.freeze([
      OrderStatus.CourierAccepted,
      OrderStatus.Cancelled,
    ]),
    [OrderStatus.CourierAccepted]: Object.freeze([OrderStatus.OnTheWay, OrderStatus.Cancelled]),
    [OrderStatus.OnTheWay]: Object.freeze([OrderStatus.Arrived, OrderStatus.Cancelled]),
    [OrderStatus.Delivering]: Object.freeze([OrderStatus.Arrived, OrderStatus.Cancelled]),
    [OrderStatus.Arrived]: Object.freeze([OrderStatus.Delivered, OrderStatus.Cancelled]),
    [OrderStatus.Delivered]: Object.freeze([OrderStatus.Completed, OrderStatus.Returned]),
    [OrderStatus.Completed]: Object.freeze([OrderStatus.Returned]),
    [OrderStatus.Returned]: Object.freeze([OrderStatus.Refunded]),
    [OrderStatus.Cancelled]: Object.freeze([]),
    [OrderStatus.Refunded]: Object.freeze([]),
    [OrderStatus.Closed]: Object.freeze([]),
  });

export class OrderStatusTransitionPolicy {
  canTransition(from: OrderStatusType, to: OrderStatusType): boolean {
    if (from === to) {
      return true;
    }

    if (isTerminalOrderStatus(from) && from !== OrderStatus.PaymentFailed) {
      return false;
    }

    const allowed = ALLOWED_TRANSITIONS[from] ?? [];
    if (allowed.includes(to)) {
      return true;
    }

    if (to === OrderStatus.Cancelled && !isTerminalOrderStatus(from)) {
      return !DELIVERY_ACTIVE_STATUSES.has(from) && from !== OrderStatus.Delivered;
    }

    return false;
  }

  assertTransition(from: OrderStatusType, to: OrderStatusType): void {
    if (!this.canTransition(from, to)) {
      throw new Error(`Invalid order status transition: ${from} → ${to}`);
    }
  }
}

export const ORDER_STATUS_LABELS: Readonly<Record<OrderStatusType, string>> = Object.freeze({
  [OrderStatus.Draft]: "Создан",
  [OrderStatus.PendingPayment]: "Ожидает оплаты",
  [OrderStatus.Paid]: "Оплачен",
  [OrderStatus.Preparing]: "Передан на склад",
  [OrderStatus.ReadyForDelivery]: "Собран",
  [OrderStatus.AssignedToCourier]: "Назначен курьер",
  [OrderStatus.CourierAccepted]: "Курьер принял",
  [OrderStatus.OnTheWay]: "В пути",
  [OrderStatus.Delivering]: "В пути",
  [OrderStatus.Arrived]: "Прибыл",
  [OrderStatus.Delivered]: "Доставлен",
  [OrderStatus.Completed]: "Завершён",
  [OrderStatus.Cancelled]: "Отменён",
  [OrderStatus.PaymentFailed]: "Оплата не прошла",
  [OrderStatus.Returned]: "Возвращён",
  [OrderStatus.Refunded]: "Возврат средств",
  [OrderStatus.Closed]: "Закрыт",
});

export function resolveOrderStatusLabel(status: OrderStatusType): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}
