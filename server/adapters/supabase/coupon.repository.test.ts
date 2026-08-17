import { describe, expect, it } from "vitest";
import { mapCouponRow } from "@server/adapters/supabase/coupon.repository";

describe("mapCouponRow", () => {
  it("maps snake_case DB fields to the camelCase CouponDTO shape", () => {
    expect(
      mapCouponRow({
        id: "coupon-1",
        code: "SAVE10",
        discount_type: "PERCENTAGE",
        discount_value: 10,
        min_order_total: 500,
        max_uses: 100,
        uses_count: 5,
        expires_at: "2026-12-31T00:00:00.000Z",
        is_active: true,
        created_at: "2026-01-01T00:00:00.000Z",
      }),
    ).toEqual({
      id: "coupon-1",
      code: "SAVE10",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrderTotal: 500,
      maxUses: 100,
      usesCount: 5,
      expiresAt: "2026-12-31T00:00:00.000Z",
      isActive: true,
      createdAt: "2026-01-01T00:00:00.000Z",
    });
  });

  it("coerces discount_value/min_order_total to numbers when Postgres returns numeric columns as strings", () => {
    const mapped = mapCouponRow({
      id: "coupon-2",
      code: "FIXED20",
      discount_type: "FIXED",
      discount_value: "20.50" as unknown as number,
      min_order_total: "100.00" as unknown as number,
      max_uses: null,
      uses_count: 0,
      expires_at: null,
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
    });

    expect(mapped.discountValue).toBe(20.5);
    expect(mapped.minOrderTotal).toBe(100);
  });
});
