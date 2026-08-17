import type { ICourierStatusRepository } from "@server/ports/courier-status.repository";
import type { CourierStatusDTO } from "@shared/contracts/courier-status";
import { supabaseAdmin } from "@server/adapters/supabase/client";

interface CourierStatusRow {
  courier_id: string;
  is_available: boolean;
  last_seen_at: string;
}

export function mapCourierStatusRow(row: CourierStatusRow): CourierStatusDTO {
  return {
    courierId: row.courier_id,
    isAvailable: row.is_available,
    lastSeenAt: row.last_seen_at,
  };
}

const COURIER_STATUS_SELECT = "courier_id, is_available, last_seen_at";

export class SupabaseCourierStatusRepository implements ICourierStatusRepository {
  async listAvailable(): Promise<CourierStatusDTO[]> {
    const { data, error } = await supabaseAdmin
      .from("courier_status")
      .select(COURIER_STATUS_SELECT)
      .eq("is_available", true);

    if (error) throw new Error(`Failed to list available couriers: ${error.message}`);
    return (data ?? []).map(mapCourierStatusRow);
  }

  async listAll(): Promise<CourierStatusDTO[]> {
    const { data, error } = await supabaseAdmin
      .from("courier_status")
      .select(COURIER_STATUS_SELECT);
    if (error) throw new Error(`Failed to list couriers: ${error.message}`);
    return (data ?? []).map(mapCourierStatusRow);
  }

  async get(courierId: string): Promise<CourierStatusDTO | null> {
    const { data, error } = await supabaseAdmin
      .from("courier_status")
      .select(COURIER_STATUS_SELECT)
      .eq("courier_id", courierId)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch courier status: ${error.message}`);
    return data ? mapCourierStatusRow(data) : null;
  }

  async setAvailability(courierId: string, isAvailable: boolean): Promise<CourierStatusDTO> {
    const { data, error } = await supabaseAdmin
      .from("courier_status")
      .upsert(
        {
          courier_id: courierId,
          is_available: isAvailable,
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: "courier_id" },
      )
      .select(COURIER_STATUS_SELECT)
      .single();

    if (error || !data) {
      throw new Error(`Failed to set courier availability: ${error?.message ?? "unknown"}`);
    }
    return mapCourierStatusRow(data);
  }

  async touch(courierId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("courier_status")
      .upsert(
        { courier_id: courierId, last_seen_at: new Date().toISOString() },
        { onConflict: "courier_id", ignoreDuplicates: false },
      );

    if (error) throw new Error(`Failed to update courier presence: ${error.message}`);
  }
}
