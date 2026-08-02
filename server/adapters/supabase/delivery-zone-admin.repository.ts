import type {
  CreateDeliveryZoneRequest,
  DeliveryZoneDTO,
  UpdateDeliveryZoneRequest,
} from "@shared/contracts/delivery";
import type { IAdminDeliveryZoneRepository } from "@server/ports/delivery-zone-admin.repository";
import { supabaseAdmin } from "@server/adapters/supabase/client";
import { mapZoneRow, ZONE_SELECT } from "@server/adapters/supabase/delivery-zone.repository";
import { DeliveryZoneNotFoundError } from "@server/domain/delivery.errors";

/** Admin-facing — sees active and inactive zones, unlike SupabaseDeliveryZoneRepository (buyer). */
export class SupabaseAdminDeliveryZoneRepository implements IAdminDeliveryZoneRepository {
  async listAll(): Promise<DeliveryZoneDTO[]> {
    const { data, error } = await supabaseAdmin
      .from("delivery_zones")
      .select(ZONE_SELECT)
      .order("sort_order", { ascending: true });

    if (error) throw new Error(`Failed to list delivery zones: ${error.message}`);
    return (data ?? []).map(mapZoneRow);
  }

  async getById(id: string): Promise<DeliveryZoneDTO | null> {
    const { data, error } = await supabaseAdmin
      .from("delivery_zones")
      .select(ZONE_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch delivery zone: ${error.message}`);
    return data ? mapZoneRow(data) : null;
  }

  async create(data: CreateDeliveryZoneRequest): Promise<DeliveryZoneDTO> {
    const { data: row, error } = await supabaseAdmin
      .from("delivery_zones")
      .insert({
        city_id: data.cityId,
        store_id: data.storeId ?? null,
        name: data.name,
        sort_order: data.sortOrder ?? 0,
        is_active: data.isActive ?? true,
      })
      .select(ZONE_SELECT)
      .single();

    if (error || !row)
      throw new Error(`Failed to create delivery zone: ${error?.message ?? "unknown"}`);
    return mapZoneRow(row);
  }

  async update(data: UpdateDeliveryZoneRequest): Promise<DeliveryZoneDTO> {
    const patch: {
      city_id?: string;
      store_id?: string | null;
      name?: string;
      sort_order?: number;
      is_active?: boolean;
    } = {};
    if (data.cityId !== undefined) patch.city_id = data.cityId;
    if (data.storeId !== undefined) patch.store_id = data.storeId;
    if (data.name !== undefined) patch.name = data.name;
    if (data.sortOrder !== undefined) patch.sort_order = data.sortOrder;
    if (data.isActive !== undefined) patch.is_active = data.isActive;

    const { data: row, error } = await supabaseAdmin
      .from("delivery_zones")
      .update(patch)
      .eq("id", data.id)
      .select(ZONE_SELECT)
      .single();

    if (error || !row)
      throw new Error(`Failed to update delivery zone: ${error?.message ?? "unknown"}`);
    return mapZoneRow(row);
  }

  async deactivate(id: string): Promise<DeliveryZoneDTO> {
    const { data: row, error } = await supabaseAdmin
      .from("delivery_zones")
      .update({ is_active: false })
      .eq("id", id)
      .select(ZONE_SELECT)
      .single();

    if (error || !row) throw new DeliveryZoneNotFoundError(id);
    return mapZoneRow(row);
  }
}
