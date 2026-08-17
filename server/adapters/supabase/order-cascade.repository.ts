import type { IOrderCascadeRepository } from "@server/ports/order-cascade.repository";
import { supabaseAdmin } from "@server/adapters/supabase/client";

/** Postgres unique_violation — https://www.postgresql.org/docs/current/errcodes-appendix.html */
const UNIQUE_VIOLATION = "23505";

export class SupabaseOrderCascadeRepository implements IOrderCascadeRepository {
  async claim(orderId: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from("order_operational_cascades")
      .insert({ order_id: orderId })
      .select("order_id");

    if (error) {
      if (error.code === UNIQUE_VIOLATION) return false;
      throw new Error(`Failed to claim order cascade: ${error.message}`);
    }

    return (data?.length ?? 0) > 0;
  }
}
