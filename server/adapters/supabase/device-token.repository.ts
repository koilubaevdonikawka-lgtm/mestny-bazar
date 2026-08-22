import type { DevicePlatform } from "@shared/contracts/push";
import type { IDeviceTokenRepository } from "@server/ports/device-token.repository";
import { supabaseAdmin } from "@server/adapters/supabase/client";

export class SupabaseDeviceTokenRepository implements IDeviceTokenRepository {
  async upsert(userId: string, token: string, platform: DevicePlatform): Promise<void> {
    const { error } = await supabaseAdmin
      .from("device_tokens")
      .upsert({ user_id: userId, token, platform }, { onConflict: "user_id,token" });

    if (error) throw new Error(`Failed to save device token: ${error.message}`);
  }
}
