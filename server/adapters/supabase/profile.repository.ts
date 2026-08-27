import type { ProfileDTO, UpdateProfileRequest, UserRole } from "@shared/contracts/user";
import type { IProfileRepository } from "@server/ports/profile.repository";
import { supabaseAdmin } from "@server/adapters/supabase/client";
import { resolveRolesForUser } from "@server/auth/resolve-user";

function mapRow(
  row: { id: string; full_name: string | null; phone: string | null; created_at: string },
  roles: UserRole[],
): ProfileDTO {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    roles,
    createdAt: row.created_at,
  };
}

/**
 * Задача №182 — first real implementation; `public.profiles` (one row per
 * auth.users, auto-inserted by the on_auth_user_created trigger,
 * 20260705202529) and its RLS already allowed SELECT/UPDATE on one's own
 * row — only the application layer (this class + ProfileService +
 * profile.executor.ts) was ever missing, per the ШАГ 0 investigation
 * (profile.functions.ts was a dead, never-called stub).
 */
export class SupabaseProfileRepository implements IProfileRepository {
  async getById(userId: string): Promise<ProfileDTO | null> {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, phone, created_at")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch profile: ${error.message}`);
    if (!data) return null;

    const roles = await resolveRolesForUser(userId);
    return mapRow(data, roles);
  }

  async update(userId: string, data: UpdateProfileRequest): Promise<ProfileDTO> {
    const patch: { full_name?: string | null; phone?: string | null } = {};
    if (data.fullName !== undefined) patch.full_name = data.fullName;
    if (data.phone !== undefined) patch.phone = data.phone;

    const { data: row, error } = await supabaseAdmin
      .from("profiles")
      .update(patch)
      .eq("id", userId)
      .select("id, full_name, phone, created_at")
      .single();

    if (error || !row) throw new Error(`Failed to update profile: ${error?.message ?? "unknown"}`);

    const roles = await resolveRolesForUser(userId);
    return mapRow(row, roles);
  }
}
