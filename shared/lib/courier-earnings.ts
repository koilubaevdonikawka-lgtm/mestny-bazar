import type { OrderDTO } from "@shared/contracts/order";
import { OrderStatus } from "@shared/contracts/order";

/**
 * Доля курьера от стоимости доставки — платформа удерживает остальные 10%
 * как комиссию (утверждено архитектором, Задача №143).
 */
export const COURIER_COMMISSION_RATE = 0.9;

/**
 * Налог для курьеров-самозанятых в КР (подоходный налог + страховые
 * взносы). Актуально на 2026 год. По объявленному налоговому графику для
 * курьеров-агрегаторов в КР ставка вырастет: 2% с 2028 года, 5% с 2030 —
 * обновить это значение, когда очередная ставка вступит в силу.
 */
export const COURIER_TAX_RATE = 0.02;

/**
 * Чистый заработок курьера по одному заказу. Формула применима только к
 * реально завершённым доставкам — вызывающий код обязан отфильтровать по
 * status === DELIVERED сам (см. sumDeliveredCourierEarnings ниже), эта
 * функция не проверяет статус и не должна вызываться для отменённых/
 * незавершённых заказов.
 */
export function calculateCourierEarnings(order: Pick<OrderDTO, "deliveryFee">): number {
  return order.deliveryFee * COURIER_COMMISSION_RATE * (1 - COURIER_TAX_RATE);
}

/** Сумма чистого заработка по всем DELIVERED заказам из списка. */
export function sumDeliveredCourierEarnings(orders: OrderDTO[]): number {
  return orders
    .filter((order) => order.status === OrderStatus.DELIVERED)
    .reduce((sum, order) => sum + calculateCourierEarnings(order), 0);
}

export interface CourierEarningsSummary {
  today: number;
  thisWeek: number;
  thisMonth: number;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Неделя начинается с понедельника (принятая в КР/РФ конвенция). */
function startOfWeek(date: Date): Date {
  const day = date.getDay();
  const diffToMonday = day === 0 ? 6 : day - 1;
  return startOfDay(new Date(date.getFullYear(), date.getMonth(), date.getDate() - diffToMonday));
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Задача №143 — заработок курьера за сегодня/эту неделю/этот месяц.
 * Периоды считаются по order.createdAt (дата создания заказа) — в OrderDTO
 * нет отдельной отметки времени завершения доставки (deliveredAt не
 * существует), createdAt — единственная доступная без новой миграции БД.
 * `now` параметризован для тестируемости (по умолчанию — текущее время).
 */
export function summarizeCourierEarnings(
  orders: OrderDTO[],
  now: Date = new Date(),
): CourierEarningsSummary {
  const delivered = orders.filter((order) => order.status === OrderStatus.DELIVERED);

  const sumSince = (since: Date): number =>
    delivered
      .filter((order) => new Date(order.createdAt) >= since)
      .reduce((sum, order) => sum + calculateCourierEarnings(order), 0);

  return {
    today: sumSince(startOfDay(now)),
    thisWeek: sumSince(startOfWeek(now)),
    thisMonth: sumSince(startOfMonth(now)),
  };
}
