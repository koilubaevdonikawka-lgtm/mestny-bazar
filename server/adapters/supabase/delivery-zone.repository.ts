import type { DeliveryFeeQuote, DeliveryZoneDTO } from "@shared/contracts/delivery";
import type { IDeliveryZoneRepository } from "@server/ports/delivery-zone.repository";
import { supabaseAdmin } from "@server/adapters/supabase/client";

function mapZone(row: {
  id: string;
  name: string;
  price: number;
  free_from: number | null;
  sort_order: number;
}): DeliveryZoneDTO {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    freeFrom: row.free_from != null ? Number(row.free_from) : null,
    sortOrder: row.sort_order,
  };
}

export class SupabaseDeliveryZoneRepository implements IDeliveryZoneRepository {
  async listActive(): Promise<DeliveryZoneDTO[]> {
    const { data, error } = await supabaseAdmin
      .from("delivery_zones")
      .select("id, name, price, free_from, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) throw new Error(`Failed to list delivery zones: ${error.message}`);
    return (data ?? []).map(mapZone);
  }

  async getById(id: string): Promise<DeliveryZoneDTO | null> {
    const { data, error } = await supabaseAdmin
      .from("delivery_zones")
      .select("id, name, price, free_from, sort_order")
      .eq("id", id)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch delivery zone: ${error.message}`);
    return data ? mapZone(data) : null;
  }

  async calculateFee(zoneId: string, subtotal: number): Promise<DeliveryFeeQuote> {
    const zone = await this.getById(zoneId);
    if (!zone) throw new Error(`Delivery zone ${zoneId} not found`);

    const isFree = zone.freeFrom != null && subtotal >= zone.freeFrom;
    return {
      zoneId: zone.id,
      zoneName: zone.name,
      fee: isFree ? 0 : zone.price,
      freeFrom: zone.freeFrom,
      subtotal,
      isFree,
    };
  }
}
