import { describe, expect, it } from "vitest";
import { mapVariantStockRow } from "@server/adapters/supabase/variant-stock.repository";

describe("mapVariantStockRow", () => {
  it("maps a tracked variant stock row with a threshold", () => {
    expect(mapVariantStockRow({ variant_id: "var-1", stock: 12, low_stock_threshold: 5 })).toEqual({
      variantId: "var-1",
      stock: 12,
      lowStockThreshold: 5,
    });
  });

  it("maps a row with no threshold override", () => {
    const mapped = mapVariantStockRow({ variant_id: "var-2", stock: 0, low_stock_threshold: null });
    expect(mapped.lowStockThreshold).toBeNull();
    expect(mapped.stock).toBe(0);
  });
});
