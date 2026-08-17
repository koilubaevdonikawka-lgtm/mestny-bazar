import type { CreateStoreRequest, StoreDTO, UpdateStoreRequest } from "@shared/contracts/delivery";
import type { IStoreRepository } from "@server/ports/store.repository";
import { supabaseAdmin } from "@server/adapters/supabase/client";

const STORE_SELECT = "id, city_id, name, address, lat, lng, is_active";

function mapStoreRow(row: {
  id: string;
  city_id: string;
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  is_active: boolean;
}): StoreDTO {
  return {
    id: row.id,
    cityId: row.city_id,
    name: row.name,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    isActive: row.is_active,
  };
}

export class SupabaseStoreRepository implements IStoreRepository {
  async listAll(): Promise<StoreDTO[]> {
    const { data, error } = await supabaseAdmin
      .from("stores")
      .select(STORE_SELECT)
      .order("name", { ascending: true });

    if (error) throw new Error(`Failed to list stores: ${error.message}`);
    return (data ?? []).map(mapStoreRow);
  }

  async getById(id: string): Promise<StoreDTO | null> {
    const { data, error } = await supabaseAdmin
      .from("stores")
      .select(STORE_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch store: ${error.message}`);
    return data ? mapStoreRow(data) : null;
  }

  async create(data: CreateStoreRequest): Promise<StoreDTO> {
    const { data: row, error } = await supabaseAdmin
      .from("stores")
      .insert({
        city_id: data.cityId,
        name: data.name,
        address: data.address,
        lat: data.lat ?? null,
        lng: data.lng ?? null,
        is_active: data.isActive ?? true,
      })
      .select(STORE_SELECT)
      .single();

    if (error || !row) throw new Error(`Failed to create store: ${error?.message ?? "unknown"}`);
    return mapStoreRow(row);
  }

  async update(data: UpdateStoreRequest): Promise<StoreDTO> {
    const patch: {
      city_id?: string;
      name?: string;
      address?: string;
      lat?: number | null;
      lng?: number | null;
      is_active?: boolean;
    } = {};
    if (data.cityId !== undefined) patch.city_id = data.cityId;
    if (data.name !== undefined) patch.name = data.name;
    if (data.address !== undefined) patch.address = data.address;
    if (data.lat !== undefined) patch.lat = data.lat;
    if (data.lng !== undefined) patch.lng = data.lng;
    if (data.isActive !== undefined) patch.is_active = data.isActive;

    const { data: row, error } = await supabaseAdmin
      .from("stores")
      .update(patch)
      .eq("id", data.id)
      .select(STORE_SELECT)
      .single();

    if (error || !row) throw new Error(`Failed to update store: ${error?.message ?? "unknown"}`);
    return mapStoreRow(row);
  }
}
