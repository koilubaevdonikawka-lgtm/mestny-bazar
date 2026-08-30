import type { DevicePlatform } from "@shared/contracts/push";
import type { DeviceTokenDTO, IDeviceTokenRepository } from "@server/ports/device-token.repository";
import { supabaseAdmin } from "@server/adapters/supabase/client";

export class SupabaseDeviceTokenRepository implements IDeviceTokenRepository {
  async upsert(userId: string, token: string, platform: DevicePlatform): Promise<void> {
    const { error } = await supabaseAdmin
      .from("device_tokens")
      .upsert({ user_id: userId, token, platform }, { onConflict: "user_id,token" });

    if (error) throw new Error(`Failed to save device token: ${error.message}`);
  }

  async listByUserId(userId: string): Promise<DeviceTokenDTO[]> {
    const { data, error } = await supabaseAdmin
      .from("device_tokens")
      .select("token, platform")
      .eq("user_id", userId);

    if (error) throw new Error(`Failed to list device tokens: ${error.message}`);
    return (data ?? []).map((row) => ({
      token: row.token,
      platform: row.platform as DevicePlatform,
    }));
  }

  async deleteByToken(token: string): Promise<void> {
    const { error } = await supabaseAdmin.from("device_tokens").delete().eq("token", token);
    if (error) throw new Error(`Failed to delete device token: ${error.message}`);
  }

  async listDistinctUserIds(): Promise<string[]> {
    const { data, error } = await supabaseAdmin.from("device_tokens").select("user_id");
    if (error) throw new Error(`Failed to list device token users: ${error.message}`);
    return [...new Set((data ?? []).map((row) => row.user_id as string))];
  }
}
