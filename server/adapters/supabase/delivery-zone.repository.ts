import type { DeliveryZoneDTO } from "@shared/contracts/delivery";
import type { IDeliveryZoneRepository } from "@server/ports/delivery-zone.repository";
import { supabaseAdmin } from "@server/adapters/supabase/client";

export function mapZoneRow(row: {
  id: string;
  city_id: string;
  store_id: string | null;
  name: string;
  sort_order: number;
  is_active: boolean;
}): DeliveryZoneDTO {
  return {
    id: row.id,
    cityId: row.city_id,
    storeId: row.store_id,
    name: row.name,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

export const ZONE_SELECT = "id, city_id, store_id, name, sort_order, is_active";

/** Buyer-facing — active zones only (see SupabaseAdminDeliveryZoneRepository for admin CRUD). */
export class SupabaseDeliveryZoneRepository implements IDeliveryZoneRepository {
  async listActive(): Promise<DeliveryZoneDTO[]> {
    const { data, error } = await supabaseAdmin
      .from("delivery_zones")
      .select(ZONE_SELECT)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) throw new Error(`Failed to list delivery zones: ${error.message}`);
    return (data ?? []).map(mapZoneRow);
  }

  /**
   * Deliberately not filtered by is_active — DeliveryZonePolicyService's
   * ZoneActiveRule (delivery-rule-engine.md) is the intended decision point
   * for "inactive zone" (denialCode ZONE_INACTIVE), not a repository-level
   * null that would be indistinguishable from "zone does not exist".
   */
  async getById(id: string): Promise<DeliveryZoneDTO | null> {
    const { data, error } = await supabaseAdmin
      .from("delivery_zones")
      .select(ZONE_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch delivery zone: ${error.message}`);
    return data ? mapZoneRow(data) : null;
  }
}
