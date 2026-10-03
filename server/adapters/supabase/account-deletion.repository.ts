import type {
  EraseCustomerDataResult,
  IAccountDeletionRepository,
} from "@server/ports/account-deletion.repository";
import type { AccountDeletionContext } from "@server/ports/account-deletion-policy.port";
import type { UserRole } from "@shared/contracts/user";
import { supabaseAdmin } from "@server/adapters/supabase/client";

const ERASE_RESULTS: readonly EraseCustomerDataResult[] = [
  "ERASED",
  "STAFF_ACCOUNT",
  "ACTIVE_ORDERS",
];

/** Maps get_account_deletion_context()'s jsonb (supabase/migrations/20261003010000_account_self_deletion.sql). */
export function mapDeletionContext(raw: unknown): AccountDeletionContext {
  const row = (raw ?? {}) as Record<string, unknown>;
  const ownership = row.ownershipRole;
  return {
    ownershipRole: ownership === "ROOT_OWNER" || ownership === "OWNER" ? ownership : null,
    accessRoles: Array.isArray(row.accessRoles) ? (row.accessRoles as UserRole[]) : [],
    rbacRoleCount: Number(row.rbacRoleCount ?? 0),
    adminScopeCount: Number(row.adminScopeCount ?? 0),
    hasStaffFootprint: row.hasStaffFootprint === true,
    activeOrderCount: Number(row.activeOrderCount ?? 0),
  };
}

export function mapEraseResult(raw: unknown): EraseCustomerDataResult {
  if (ERASE_RESULTS.includes(raw as EraseCustomerDataResult)) {
    return raw as EraseCustomerDataResult;
  }
  throw new Error(`Unexpected erase_customer_account_data result: ${String(raw)}`);
}

export class SupabaseAccountDeletionRepository implements IAccountDeletionRepository {
  async getDeletionContext(userId: string): Promise<AccountDeletionContext> {
    const { data, error } = await supabaseAdmin.rpc("get_account_deletion_context", {
      p_user_id: userId,
    });
    if (error) throw new Error(`Failed to read account deletion context: ${error.message}`);
    return mapDeletionContext(data);
  }

  async eraseCustomerData(userId: string): Promise<EraseCustomerDataResult> {
    const { data, error } = await supabaseAdmin.rpc("erase_customer_account_data", {
      p_user_id: userId,
    });
    if (error) throw new Error(`Failed to erase customer account data: ${error.message}`);
    return mapEraseResult(data);
  }

  async deleteAuthUser(userId: string): Promise<void> {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    // 404 = already gone (a retried request whose earlier attempt did delete the
    // user but lost the response) — the desired end state, not a failure.
    if (error && error.status !== 404) {
      throw new Error(`Failed to delete auth user: ${error.message}`);
    }
  }
}
