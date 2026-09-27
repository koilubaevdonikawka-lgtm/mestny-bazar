import { describe, expect, it, vi } from "vitest";
import {
  GUEST_ORDER_SCAN_LIMIT,
  GuestCustomerService,
  aggregateGuestOrders,
} from "@server/domain/guest-customer.service";
import type {
  GuestOrderContactRow,
  IGuestCustomerRepository,
} from "@server/ports/guest-customer.repository";

function repoReturning(rows: GuestOrderContactRow[]): IGuestCustomerRepository {
  return { listRecentGuestOrderContacts: vi.fn(async () => rows) };
}

describe("aggregateGuestOrders", () => {
  it("groups by phone with first/last order date and count, newest guest first", () => {
    const result = aggregateGuestOrders([
      { phone: "996700111222", createdAt: "2026-09-20T10:00:00.000Z" },
      { phone: "996555000000", createdAt: "2026-09-10T10:00:00.000Z" },
      { phone: "996700111222", createdAt: "2026-09-01T10:00:00.000Z" },
      { phone: "996700111222", createdAt: "2026-09-15T10:00:00.000Z" },
    ]);

    expect(result).toEqual([
      {
        phone: "996700111222",
        firstOrderAt: "2026-09-01T10:00:00.000Z",
        lastOrderAt: "2026-09-20T10:00:00.000Z",
        ordersCount: 3,
      },
      {
        phone: "996555000000",
        firstOrderAt: "2026-09-10T10:00:00.000Z",
        lastOrderAt: "2026-09-10T10:00:00.000Z",
        ordersCount: 1,
      },
    ]);
  });

  it("skips orders with an empty phone", () => {
    expect(aggregateGuestOrders([{ phone: "  ", createdAt: "2026-09-01T00:00:00.000Z" }])).toEqual(
      [],
    );
  });
});

describe("GuestCustomerService", () => {
  const rows: GuestOrderContactRow[] = ["1", "2", "3"].map((n, i) => ({
    phone: `99670000000${n}`,
    createdAt: `2026-09-0${3 - i}T00:00:00.000Z`,
  }));

  it("reads a bounded window and paginates unique phones", async () => {
    const repo = repoReturning(rows);
    const page = await new GuestCustomerService(repo).listGuestCustomers({ offset: 1, limit: 1 });

    expect(repo.listRecentGuestOrderContacts).toHaveBeenCalledWith(GUEST_ORDER_SCAN_LIMIT);
    expect(page.items.map((g) => g.phone)).toEqual(["996700000002"]);
    expect(page.total).toBe(3);
    expect(page.hasMore).toBe(true);
    expect(page.truncated).toBe(false);
  });

  it("flags truncation when the scan cap is reached", async () => {
    const full = Array.from({ length: GUEST_ORDER_SCAN_LIMIT }, () => rows[0]);
    const page = await new GuestCustomerService(repoReturning(full)).listGuestCustomers({
      offset: 0,
      limit: 50,
    });

    expect(page.truncated).toBe(true);
    expect(page.items).toHaveLength(1);
    expect(page.items[0].ordersCount).toBe(GUEST_ORDER_SCAN_LIMIT);
  });
});
