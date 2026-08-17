import type { CityDTO } from "@shared/contracts/delivery";
import type { ICityRepository } from "@server/ports/city.repository";
import { supabaseAdmin } from "@server/adapters/supabase/client";

function mapCityRow(row: {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  sort_order: number;
  is_active: boolean;
}): CityDTO {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    timezone: row.timezone,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

export class SupabaseCityRepository implements ICityRepository {
  async listActive(): Promise<CityDTO[]> {
    const { data, error } = await supabaseAdmin
      .from("cities")
      .select("id, name, slug, timezone, sort_order, is_active")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) throw new Error(`Failed to list cities: ${error.message}`);
    return (data ?? []).map(mapCityRow);
  }
}
