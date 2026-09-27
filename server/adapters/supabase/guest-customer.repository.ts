import type {
  GuestOrderContactRow,
  IGuestCustomerRepository,
} from "@server/ports/guest-customer.repository";
import { supabaseAdmin } from "@server/adapters/supabase/client";

/** PostgREST caps a single response (max_rows, 1000 on Supabase) — read in pages of this size. */
const PAGE_SIZE = 1000;

export class SupabaseGuestCustomerRepository implements IGuestCustomerRepository {
  async listRecentGuestOrderContacts(maxRows: number): Promise<GuestOrderContactRow[]> {
    const rows: GuestOrderContactRow[] = [];
    while (rows.length < maxRows) {
      const from = rows.length;
      const to = Math.min(from + PAGE_SIZE, maxRows) - 1;
      const { data, error } = await supabaseAdmin
        .from("orders")
        .select("customer_phone, created_at")
        .is("user_id", null)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw new Error(`Failed to list guest orders: ${error.message}`);
      const page = data ?? [];
      for (const row of page) rows.push({ phone: row.customer_phone, createdAt: row.created_at });
      if (page.length < to - from + 1) break;
    }
    return rows;
  }
}
