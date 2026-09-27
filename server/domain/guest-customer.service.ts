import type {
  GuestOrderContactRow,
  IGuestCustomerRepository,
} from "@server/ports/guest-customer.repository";
import type {
  GuestCustomerDTO,
  GuestCustomerPageDTO,
  ListGuestCustomersRequest,
} from "@shared/contracts/user-admin";

/**
 * Upper bound on guest orders read per request — PostgREST has no GROUP BY,
 * so grouping by phone happens here; the cap keeps a request bounded even
 * with thousands of guest orders (older ones beyond it are reported as
 * `truncated` rather than silently loaded).
 */
export const GUEST_ORDER_SCAN_LIMIT = 5000;

export function aggregateGuestOrders(rows: GuestOrderContactRow[]): GuestCustomerDTO[] {
  const byPhone = new Map<string, GuestCustomerDTO>();
  for (const row of rows) {
    const phone = row.phone.trim();
    if (!phone) continue;
    const existing = byPhone.get(phone);
    if (!existing) {
      byPhone.set(phone, {
        phone,
        firstOrderAt: row.createdAt,
        lastOrderAt: row.createdAt,
        ordersCount: 1,
      });
      continue;
    }
    existing.ordersCount += 1;
    if (row.createdAt < existing.firstOrderAt) existing.firstOrderAt = row.createdAt;
    if (row.createdAt > existing.lastOrderAt) existing.lastOrderAt = row.createdAt;
  }
  return [...byPhone.values()].sort((a, b) => b.lastOrderAt.localeCompare(a.lastOrderAt));
}

export class GuestCustomerService {
  constructor(private readonly guests: IGuestCustomerRepository) {}

  async listGuestCustomers(request: ListGuestCustomersRequest): Promise<GuestCustomerPageDTO> {
    const rows = await this.guests.listRecentGuestOrderContacts(GUEST_ORDER_SCAN_LIMIT);
    const all = aggregateGuestOrders(rows);
    const end = request.offset + request.limit;
    return {
      items: all.slice(request.offset, end),
      total: all.length,
      hasMore: end < all.length,
      truncated: rows.length >= GUEST_ORDER_SCAN_LIMIT,
      scanLimit: GUEST_ORDER_SCAN_LIMIT,
    };
  }
}
