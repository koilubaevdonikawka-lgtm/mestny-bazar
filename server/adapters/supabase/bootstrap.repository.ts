import type { IBootstrapRepository } from "@server/ports/bootstrap.repository";
import { BootstrapAlreadyCompletedError } from "@server/domain/bootstrap.errors";
import { supabaseAdmin } from "@server/adapters/supabase/client";

const ALREADY_COMPLETED_MARKER = "BOOTSTRAP_ALREADY_COMPLETED";

export class SupabaseBootstrapRepository implements IBootstrapRepository {
  async claimRootOwner(userId: string): Promise<void> {
    const { error } = await supabaseAdmin.rpc("claim_root_owner", { p_user_id: userId });

    if (error) {
      if (error.message.includes(ALREADY_COMPLETED_MARKER)) {
        throw new BootstrapAlreadyCompletedError();
      }
      throw new Error(`Failed to claim Root Owner: ${error.message}`);
    }
  }
}
