import type {
  AddressDTO,
  CreateAddressRequest,
  UpdateAddressRequest,
} from "@shared/contracts/delivery";
import type { IAddressRepository } from "@server/ports/address.repository";
import { supabaseAdmin } from "@server/adapters/supabase/client";
import type { TablesUpdate } from "@/integrations/supabase/types";

function mapRow(row: {
  id: string;
  label: string | null;
  full_address: string;
  city: string | null;
  district: string | null;
  notes: string | null;
  zone_id: string | null;
  is_default: boolean;
}): AddressDTO {
  return {
    id: row.id,
    label: row.label,
    fullAddress: row.full_address,
    city: row.city,
    district: row.district,
    notes: row.notes,
    zoneId: row.zone_id,
    isDefault: row.is_default,
  };
}

export class SupabaseAddressRepository implements IAddressRepository {
  private async clearOtherDefaults(userId: string, exceptId?: string): Promise<void> {
    let query = supabaseAdmin.from("addresses").update({ is_default: false }).eq("user_id", userId);

    if (exceptId) {
      query = query.neq("id", exceptId);
    }

    const { error } = await query;
    if (error) throw new Error(`Failed to clear default addresses: ${error.message}`);
  }

  async listByUser(userId: string): Promise<AddressDTO[]> {
    const { data, error } = await supabaseAdmin
      .from("addresses")
      .select("id, label, full_address, city, district, notes, zone_id, is_default")
      .eq("user_id", userId)
      .order("is_default", { ascending: false });

    if (error) throw new Error(`Failed to list addresses: ${error.message}`);
    return (data ?? []).map(mapRow);
  }

  async getById(id: string, userId: string): Promise<AddressDTO | null> {
    const { data, error } = await supabaseAdmin
      .from("addresses")
      .select("id, label, full_address, city, district, notes, zone_id, is_default")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch address: ${error.message}`);
    return data ? mapRow(data) : null;
  }

  async create(userId: string, data: CreateAddressRequest): Promise<AddressDTO> {
    const isDefault = data.isDefault ?? false;
    if (isDefault) {
      await this.clearOtherDefaults(userId);
    }

    const { data: row, error } = await supabaseAdmin
      .from("addresses")
      .insert({
        user_id: userId,
        label: data.label ?? null,
        full_address: data.fullAddress,
        city: data.city ?? null,
        district: data.district ?? null,
        notes: data.notes ?? null,
        zone_id: data.zoneId ?? null,
        is_default: isDefault,
      })
      .select("id, label, full_address, city, district, notes, zone_id, is_default")
      .single();

    if (error || !row) throw new Error(`Failed to create address: ${error?.message ?? "unknown"}`);
    return mapRow(row);
  }

  async update(userId: string, data: UpdateAddressRequest): Promise<AddressDTO> {
    if (data.isDefault === true) {
      await this.clearOtherDefaults(userId, data.id);
    }

    const patch: TablesUpdate<"addresses"> = {};
    if (data.label !== undefined) patch.label = data.label;
    if (data.fullAddress !== undefined) patch.full_address = data.fullAddress;
    if (data.city !== undefined) patch.city = data.city;
    if (data.district !== undefined) patch.district = data.district;
    if (data.notes !== undefined) patch.notes = data.notes;
    if (data.zoneId !== undefined) patch.zone_id = data.zoneId;
    if (data.isDefault !== undefined) patch.is_default = data.isDefault;

    const { data: row, error } = await supabaseAdmin
      .from("addresses")
      .update(patch)
      .eq("id", data.id)
      .eq("user_id", userId)
      .select("id, label, full_address, city, district, notes, zone_id, is_default")
      .single();

    if (error || !row) throw new Error(`Failed to update address: ${error?.message ?? "unknown"}`);
    return mapRow(row);
  }

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("addresses")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw new Error(`Failed to delete address: ${error.message}`);
  }
}
