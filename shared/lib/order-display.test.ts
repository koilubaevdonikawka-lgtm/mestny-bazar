import { describe, expect, it } from "vitest";
import {
  formatMoney,
  formatOrderDate,
  formatOrderStatus,
  formatPaymentStatus,
  getTimelineStepState,
  twoGisRouteUrl,
  twoGisSearchUrl,
  yandexMapsRouteUrl,
  yandexMapsSearchUrl,
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

describe("yandexMapsSearchUrl", () => {
  it("Задача №146 — appends the resolved city and ', Кыргызстан' to the address", () => {
    const url = yandexMapsSearchUrl("1 микрорайон", "Бишкек");
    expect(url).toBe(
      "https://yandex.ru/maps/?text=" + encodeURIComponent("1 микрорайон, Бишкек, Кыргызстан"),
    );
  });

  it("falls back to just the address + ', Кыргызстан' when the city can't be resolved", () => {
    const url = yandexMapsSearchUrl("1 микрорайон", null);
    expect(url).toBe(
      "https://yandex.ru/maps/?text=" + encodeURIComponent("1 микрорайон, Кыргызстан"),
    );
  });

  it("treats an omitted city the same as null", () => {
    expect(yandexMapsSearchUrl("1 микрорайон")).toBe(yandexMapsSearchUrl("1 микрорайон", null));
  });
});

describe("twoGisSearchUrl", () => {
  it("Задача №146 — uses the 2GIS Kyrgyzstan text-search URL with the resolved city + country", () => {
    const url = twoGisSearchUrl("1 микрорайон", "Бишкек");
    expect(url).toBe(
      "https://2gis.kg/search/" + encodeURIComponent("1 микрорайон, Бишкек, Кыргызстан"),
    );
  });

  it("falls back to just the address + ', Кыргызстан' when the city can't be resolved", () => {
    const url = twoGisSearchUrl("1 микрорайон", null);
    expect(url).toBe("https://2gis.kg/search/" + encodeURIComponent("1 микрорайон, Кыргызстан"));
  });
});

describe("yandexMapsRouteUrl", () => {
  it("Задача №151 — builds a route-to-point URL from lat/lon, not a text search", () => {
    expect(yandexMapsRouteUrl(42.874621, 74.612456)).toBe(
      "https://yandex.ru/maps/?rtext=~42.874621,74.612456&rtt=auto",
    );
  });
});

describe("twoGisRouteUrl", () => {
  it("Задача №151 — builds a route-to-point URL in lon,lat order for 2GIS", () => {
    expect(twoGisRouteUrl(42.874621, 74.612456)).toBe(
      "https://2gis.kg/directions/points/|74.612456,42.874621",
    );
  });
});
