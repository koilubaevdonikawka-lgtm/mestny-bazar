import { describe, expect, it } from "vitest";
import {
  COURIER_COMMISSION_RATE,
  COURIER_TAX_RATE,
  calculateCourierEarnings,
  sumDeliveredCourierEarnings,
  summarizeCourierEarnings,
} from "./courier-earnings";
import type { OrderDTO } from "@shared/contracts/order";
import { OrderStatus } from "@shared/contracts/order";

function makeOrder(overrides: Partial<OrderDTO> = {}): OrderDTO {
  return {
    id: "order-1",
    userId: null,
    orderNumber: 1,
    status: OrderStatus.DELIVERED,
    paymentStatus: "paid",
    paymentMethod: "CASH",
    subtotal: 500,
    deliveryFee: 200,
    discountAmount: 0,
    couponCode: null,
    total: 700,
    currency: "KGS",
    customerName: "Buyer",
    customerPhone: "996700000000",
    addressSnapshot: "addr",
    notes: null,
    paymentUrl: null,
    items: [],
    createdAt: new Date().toISOString(),
    paidAt: null,
    assignedCourierId: "courier-1",
    zoneId: null,
    deliveryTariffId: null,
    deliveryEtaMinMinutes: null,
    deliveryEtaMaxMinutes: null,
    deliveryLatitude: null,
    deliveryLongitude: null,
    ...overrides,
  };
}

describe("calculateCourierEarnings", () => {
  it("applies the commission rate then the tax rate to deliveryFee", () => {
    const order = makeOrder({ deliveryFee: 200 });
    // 200 * 0.90 * (1 - 0.02) = 200 * 0.90 * 0.98 = 176.4
    expect(calculateCourierEarnings(order)).toBeCloseTo(176.4, 5);
  });

  it("uses the documented constants (0.90 commission, 0.02 tax)", () => {
    expect(COURIER_COMMISSION_RATE).toBe(0.9);
    expect(COURIER_TAX_RATE).toBe(0.02);
  });

  it("is zero for a zero delivery fee", () => {
    expect(calculateCourierEarnings(makeOrder({ deliveryFee: 0 }))).toBe(0);
  });
});

describe("sumDeliveredCourierEarnings", () => {
  it("only sums DELIVERED orders, ignoring cancelled/in-progress ones", () => {
    const orders = [
      makeOrder({ id: "a", status: OrderStatus.DELIVERED, deliveryFee: 100 }),
      makeOrder({ id: "b", status: OrderStatus.CANCELLED, deliveryFee: 100 }),
      makeOrder({ id: "c", status: OrderStatus.OUT_FOR_DELIVERY, deliveryFee: 100 }),
      makeOrder({ id: "d", status: OrderStatus.DELIVERED, deliveryFee: 300 }),
    ];

    // Only a (100) and d (300) count: (100+300) * 0.90 * 0.98 = 352.8
    expect(sumDeliveredCourierEarnings(orders)).toBeCloseTo(352.8, 5);
  });

  it("returns 0 for an empty list", () => {
    expect(sumDeliveredCourierEarnings([])).toBe(0);
  });
});

describe("summarizeCourierEarnings", () => {
  const now = new Date("2026-08-25T12:00:00.000Z"); // Tuesday

  it("buckets a DELIVERED order created today into all three periods", () => {
    const order = makeOrder({
      status: OrderStatus.DELIVERED,
      deliveryFee: 100,
      createdAt: new Date("2026-08-25T09:00:00.000Z").toISOString(),
    });

    const summary = summarizeCourierEarnings([order], now);
    const expected = calculateCourierEarnings(order);

    expect(summary.today).toBeCloseTo(expected, 5);
    expect(summary.thisWeek).toBeCloseTo(expected, 5);
    expect(summary.thisMonth).toBeCloseTo(expected, 5);
  });

  it("excludes an order from earlier this week from today's total but includes it in week/month", () => {
    const order = makeOrder({
      status: OrderStatus.DELIVERED,
      deliveryFee: 100,
      // Monday of the same week as `now` (2026-08-24), not today.
      createdAt: new Date("2026-08-24T09:00:00.000Z").toISOString(),
    });

    const summary = summarizeCourierEarnings([order], now);

    expect(summary.today).toBe(0);
    expect(summary.thisWeek).toBeGreaterThan(0);
    expect(summary.thisMonth).toBeGreaterThan(0);
  });

  it("excludes an order from earlier this month (but a different week) from week's total", () => {
    const order = makeOrder({
      status: OrderStatus.DELIVERED,
      deliveryFee: 100,
      createdAt: new Date("2026-08-03T09:00:00.000Z").toISOString(),
    });

    const summary = summarizeCourierEarnings([order], now);

    expect(summary.today).toBe(0);
    expect(summary.thisWeek).toBe(0);
    expect(summary.thisMonth).toBeGreaterThan(0);
  });

  it("excludes an order from last month entirely", () => {
    const order = makeOrder({
      status: OrderStatus.DELIVERED,
      deliveryFee: 100,
      createdAt: new Date("2026-07-15T09:00:00.000Z").toISOString(),
    });

    const summary = summarizeCourierEarnings([order], now);

    expect(summary.today).toBe(0);
    expect(summary.thisWeek).toBe(0);
    expect(summary.thisMonth).toBe(0);
  });

  it("ignores non-DELIVERED orders even if created today", () => {
    const order = makeOrder({
      status: OrderStatus.CANCELLED,
      deliveryFee: 100,
      createdAt: now.toISOString(),
    });

    const summary = summarizeCourierEarnings([order], now);

    expect(summary.today).toBe(0);
    expect(summary.thisWeek).toBe(0);
    expect(summary.thisMonth).toBe(0);
  });
});
