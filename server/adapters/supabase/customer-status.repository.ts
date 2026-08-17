import type { ICustomerStatusRepository } from "@server/ports/customer-status.repository";
import { supabaseAdmin } from "@server/adapters/supabase/client";

export class SupabaseCustomerStatusRepository implements ICustomerStatusRepository {
  async isBlocked(userId: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("is_blocked")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw new Error(`Failed to check customer status: ${error.message}`);
    return data?.is_blocked ?? false;
  }
}
