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
  /**
   * Atomically clears every other default for the user and marks addressId as
   * the default, in one DB transaction — see the migration this RPC came from
   * for why a plain "clear others, then UPDATE this row" from application code
   * is a real race between two concurrent "set as default" requests.
   */
  private async setDefaultAddress(userId: string, addressId: string): Promise<void> {
    const { error } = await supabaseAdmin.rpc("set_default_address", {
      p_user_id: userId,
      p_address_id: addressId,
    });
    if (error) throw new Error(`Failed to set default address: ${error.message}`);
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

    // Always insert as non-default, then promote atomically below if
    // requested — keeps the default-clearing logic in one place (the RPC)
    // instead of duplicating it as a pre-insert clear.
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
        is_default: false,
      })
      .select("id, label, full_address, city, district, notes, zone_id, is_default")
      .single();

    if (error || !row) throw new Error(`Failed to create address: ${error?.message ?? "unknown"}`);
    if (!isDefault) return mapRow(row);

    await this.setDefaultAddress(userId, row.id);
    return { ...mapRow(row), isDefault: true };
  }

  async update(userId: string, data: UpdateAddressRequest): Promise<AddressDTO> {
    if (data.isDefault === true) {
      await this.setDefaultAddress(userId, data.id);
    }

    const patch: TablesUpdate<"addresses"> = {};
    if (data.label !== undefined) patch.label = data.label;
    if (data.fullAddress !== undefined) patch.full_address = data.fullAddress;
    if (data.city !== undefined) patch.city = data.city;
    if (data.district !== undefined) patch.district = data.district;
    if (data.notes !== undefined) patch.notes = data.notes;
    if (data.zoneId !== undefined) patch.zone_id = data.zoneId;
    // isDefault:true was already applied atomically above; only a plain
    // is_default:false needs to go through the regular field patch.
    if (data.isDefault === false) patch.is_default = false;

    if (Object.keys(patch).length === 0) {
      const row = await this.getById(data.id, userId);
      if (!row) throw new Error(`Address ${data.id} not found after update`);
      return row;
    }

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
