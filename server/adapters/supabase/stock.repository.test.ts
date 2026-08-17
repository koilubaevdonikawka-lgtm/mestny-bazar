import { describe, expect, it } from "vitest";
import { mapStockRow } from "@server/adapters/supabase/stock.repository";

describe("mapStockRow", () => {
  it("maps a row with a threshold override", () => {
    expect(
      mapStockRow({
        id: "p1",
        name: "Молоко",
        stock: 12,
        low_stock_threshold: 10,
        category_id: "cat-1",
        unit: "л",
      }),
    ).toEqual({
      productId: "p1",
      name: "Молоко",
      stock: 12,
      lowStockThreshold: 10,
      categoryId: "cat-1",
      unit: "л",
    });
  });

  it("maps a row with no threshold override (null)", () => {
    const mapped = mapStockRow({
      id: "p2",
      name: "Хлеб",
      stock: 0,
      low_stock_threshold: null,
      category_id: null,
      unit: null,
    });

    expect(mapped.lowStockThreshold).toBeNull();
    expect(mapped.stock).toBe(0);
  });
});
