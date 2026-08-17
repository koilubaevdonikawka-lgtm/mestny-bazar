import { describe, expect, it } from "vitest";
import {
  formatMoney,
  formatOrderDate,
  formatOrderStatus,
  formatPaymentStatus,
  getTimelineStepState,
} from "./order-display";
import { OrderStatus } from "@shared/contracts/order";

describe("getTimelineStepState", () => {
  it("marks every step as cancelled when the order itself is cancelled", () => {
    expect(getTimelineStepState(OrderStatus.CANCELLED, OrderStatus.CREATED)).toBe("cancelled");
    expect(getTimelineStepState(OrderStatus.CANCELLED, OrderStatus.DELIVERED)).toBe("cancelled");
  });

  it("marks earlier steps as completed", () => {
    expect(getTimelineStepState(OrderStatus.ASSEMBLING, OrderStatus.PAID)).toBe("completed");
  });

  it("marks the matching step as current", () => {
    expect(getTimelineStepState(OrderStatus.ASSEMBLING, OrderStatus.ASSEMBLING)).toBe("current");
  });

  it("marks later steps as upcoming", () => {
    expect(getTimelineStepState(OrderStatus.ASSEMBLING, OrderStatus.DELIVERED)).toBe("upcoming");
  });

  it("treats the first step as current when the order was just created", () => {
    expect(getTimelineStepState(OrderStatus.CREATED, OrderStatus.CREATED)).toBe("current");
    expect(getTimelineStepState(OrderStatus.CREATED, OrderStatus.PAID)).toBe("upcoming");
  });

  it("treats the last step as completed once the order is delivered", () => {
    expect(getTimelineStepState(OrderStatus.DELIVERED, OrderStatus.DELIVERED)).toBe("current");
    expect(getTimelineStepState(OrderStatus.DELIVERED, OrderStatus.CREATED)).toBe("completed");
  });
});

describe("formatOrderStatus / formatPaymentStatus", () => {
  it("returns the Russian label for every known order status", () => {
    expect(formatOrderStatus(OrderStatus.CREATED)).toBe("Создан");
    expect(formatOrderStatus(OrderStatus.DELIVERED)).toBe("Доставлен");
    expect(formatOrderStatus(OrderStatus.CANCELLED)).toBe("Отменён");
  });

  it("returns the Russian label for every known payment status", () => {
    expect(formatPaymentStatus("unpaid")).toBe("Не оплачен");
    expect(formatPaymentStatus("paid")).toBe("Оплачен");
    expect(formatPaymentStatus("refunded")).toBe("Возврат");
  });
});

describe("formatMoney", () => {
  it("formats to two decimal places with the currency code", () => {
    expect(formatMoney(120, "KGS")).toBe("120.00 KGS");
  });

  it("rounds to two decimal places rather than truncating", () => {
    expect(formatMoney(99.999, "KGS")).toBe("100.00 KGS");
  });

  it("handles zero", () => {
    expect(formatMoney(0, "KGS")).toBe("0.00 KGS");
  });
});

describe("formatOrderDate", () => {
  it("produces a non-empty localized date string for a valid ISO timestamp", () => {
    const result = formatOrderDate("2026-03-15T14:30:00.000Z");
    expect(result.length).toBeGreaterThan(0);
    expect(result).not.toBe("Invalid Date");
  });
});
