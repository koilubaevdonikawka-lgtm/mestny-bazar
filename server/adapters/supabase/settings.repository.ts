import { supabaseAdmin } from "@server/adapters/supabase/client";
import type { ISettingsRepository } from "@server/ports/settings.repository";
import type { PlatformSettingDTO, SettingValue } from "@shared/contracts/settings";

interface PlatformSettingRow {
  key: string;
  value: unknown;
  category: string;
  updated_by: string | null;
  updated_at: string;
}

export function mapSettingRow(row: PlatformSettingRow): PlatformSettingDTO {
  return {
    key: row.key,
    // jsonb column — genuinely a SettingValue by construction (only ever
    // written via set() below, which accepts SettingValue).
    value: row.value as SettingValue,
    category: row.category,
    updatedBy: row.updated_by,
    updatedAt: row.updated_at,
  };
}

const SETTING_SELECT = "key, value, category, updated_by, updated_at";

export class SupabaseSettingsRepository implements ISettingsRepository {
  async list(): Promise<PlatformSettingDTO[]> {
    const { data, error } = await supabaseAdmin
      .from("platform_settings")
      .select(SETTING_SELECT)
      .order("category", { ascending: true })
      .order("key", { ascending: true });

    if (error) throw new Error(`Failed to list settings: ${error.message}`);
    return (data ?? []).map(mapSettingRow);
  }

  async get(key: string): Promise<PlatformSettingDTO | null> {
    const { data, error } = await supabaseAdmin
      .from("platform_settings")
      .select(SETTING_SELECT)
      .eq("key", key)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch setting: ${error.message}`);
    return data ? mapSettingRow(data) : null;
  }

  async set(
    key: string,
    value: SettingValue,
    category: string,
    updatedBy: string,
  ): Promise<PlatformSettingDTO> {
    const { data, error } = await supabaseAdmin
      .from("platform_settings")
      .upsert(
        {
          key,
          value: value as never,
          category,
          updated_by: updatedBy,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" },
      )
      .select(SETTING_SELECT)
      .single();

    if (error || !data) throw new Error(`Failed to save setting: ${error?.message ?? "unknown"}`);
    return mapSettingRow(data);
  }
}
