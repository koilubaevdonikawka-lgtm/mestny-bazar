import { describe, expect, it } from "vitest";
import { fromDbOrderStatus, toDbOrderStatus } from "@server/adapters/supabase/order.mapper";
import { OrderStatus } from "@shared/contracts/order";

describe("order status DB mapping", () => {
  it("round-trips every domain status through the DB representation unchanged", () => {
    for (const status of Object.values(OrderStatus)) {
      expect(fromDbOrderStatus(toDbOrderStatus(status))).toBe(status);
    }
  });

  it("maps every domain status to a distinct DB value (no collapsing)", () => {
    const dbValues = Object.values(OrderStatus).map(toDbOrderStatus);
    expect(new Set(dbValues).size).toBe(dbValues.length);
  });
});
