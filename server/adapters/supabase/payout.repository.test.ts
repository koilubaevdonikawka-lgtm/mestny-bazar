import { describe, expect, it } from "vitest";
import { mapPayoutRow } from "@server/adapters/supabase/payout.repository";

describe("mapPayoutRow", () => {
  it("maps snake_case DB fields to the camelCase SellerPayoutDTO shape", () => {
    expect(
      mapPayoutRow({
        id: "payout-1",
        seller_id: "seller-1",
        period_start: "2026-01-01T00:00:00.000Z",
        period_end: "2026-01-31T00:00:00.000Z",
        gross_revenue: 1000,
        commission_rate: 0.1,
        commission_amount: 100,
        payout_amount: 900,
        status: "PENDING",
        created_at: "2026-02-01T00:00:00.000Z",
        completed_at: null,
      }),
    ).toEqual({
      id: "payout-1",
      sellerId: "seller-1",
      periodStart: "2026-01-01T00:00:00.000Z",
      periodEnd: "2026-01-31T00:00:00.000Z",
      grossRevenue: 1000,
      commissionRate: 0.1,
      commissionAmount: 100,
      payoutAmount: 900,
      status: "PENDING",
      createdAt: "2026-02-01T00:00:00.000Z",
      completedAt: null,
    });
  });

  it("coerces numeric columns to numbers even when Postgres returns them as strings", () => {
    const mapped = mapPayoutRow({
      id: "payout-2",
      seller_id: "seller-1",
      period_start: "2026-01-01T00:00:00.000Z",
      period_end: "2026-01-31T00:00:00.000Z",
      gross_revenue: "1000.50" as unknown as number,
      commission_rate: "0.10" as unknown as number,
      commission_amount: "100.05" as unknown as number,
      payout_amount: "900.45" as unknown as number,
      status: "COMPLETED",
      created_at: "2026-02-01T00:00:00.000Z",
      completed_at: "2026-02-02T00:00:00.000Z",
    });

    expect(mapped.grossRevenue).toBe(1000.5);
    expect(mapped.commissionRate).toBe(0.1);
    expect(mapped.commissionAmount).toBe(100.05);
    expect(mapped.payoutAmount).toBe(900.45);
    expect(mapped.completedAt).toBe("2026-02-02T00:00:00.000Z");
  });
});
