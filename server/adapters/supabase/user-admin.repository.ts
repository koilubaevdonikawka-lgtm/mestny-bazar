import type { IUserAdminRepository } from "@server/ports/user-admin.repository";
import type { AdminScope, AdminUserDTO } from "@shared/contracts/user-admin";
import type { UserRole } from "@shared/contracts/user";
import { supabaseAdmin } from "@server/adapters/supabase/client";

interface ProfileRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  is_blocked: boolean;
  created_at: string;
}

/** Merges profiles + user_roles + admin_scopes in application code — Supabase's query builder has no clean multi-table group-by for "each user's array of roles/scopes". */
export class SupabaseUserAdminRepository implements IUserAdminRepository {
  async listUsers(): Promise<AdminUserDTO[]> {
    const [profilesRes, rolesRes, scopesRes] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, full_name, phone, is_blocked, created_at")
        .order("created_at", { ascending: false }),
      supabaseAdmin.from("user_roles").select("user_id, role"),
      supabaseAdmin.from("admin_scopes").select("user_id, scope"),
    ]);

    if (profilesRes.error) throw new Error(`Failed to list users: ${profilesRes.error.message}`);
    if (rolesRes.error) throw new Error(`Failed to list user roles: ${rolesRes.error.message}`);
    if (scopesRes.error) throw new Error(`Failed to list admin scopes: ${scopesRes.error.message}`);

    return this.merge(profilesRes.data ?? [], rolesRes.data ?? [], scopesRes.data ?? []);
  }

  async getById(userId: string): Promise<AdminUserDTO | null> {
    const [profileRes, rolesRes, scopesRes] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, full_name, phone, is_blocked, created_at")
        .eq("id", userId)
        .maybeSingle(),
      supabaseAdmin.from("user_roles").select("user_id, role").eq("user_id", userId),
      supabaseAdmin.from("admin_scopes").select("user_id, scope").eq("user_id", userId),
    ]);

    if (profileRes.error) throw new Error(`Failed to fetch user: ${profileRes.error.message}`);
    if (!profileRes.data) return null;
    if (rolesRes.error) throw new Error(`Failed to fetch user roles: ${rolesRes.error.message}`);
    if (scopesRes.error)
      throw new Error(`Failed to fetch admin scopes: ${scopesRes.error.message}`);

    const [user] = this.merge([profileRes.data], rolesRes.data ?? [], scopesRes.data ?? []);
    return user;
  }

  async assignRole(userId: string, role: UserRole): Promise<void> {
    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role }, { onConflict: "user_id,role", ignoreDuplicates: true });

    if (error) throw new Error(`Failed to assign role: ${error.message}`);
  }

  async revokeRole(userId: string, role: UserRole): Promise<void> {
    const { error } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", role);

    if (error) throw new Error(`Failed to revoke role: ${error.message}`);
  }

  async assignScope(userId: string, scope: AdminScope): Promise<void> {
    const { error } = await supabaseAdmin
      .from("admin_scopes")
      .upsert({ user_id: userId, scope }, { onConflict: "user_id,scope", ignoreDuplicates: true });

    if (error) throw new Error(`Failed to assign admin scope: ${error.message}`);
  }

  async revokeScope(userId: string, scope: AdminScope): Promise<void> {
    const { error } = await supabaseAdmin
      .from("admin_scopes")
      .delete()
      .eq("user_id", userId)
      .eq("scope", scope);

    if (error) throw new Error(`Failed to revoke admin scope: ${error.message}`);
  }

  async setBlocked(userId: string, isBlocked: boolean): Promise<void> {
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ is_blocked: isBlocked })
      .eq("id", userId);

    if (error) throw new Error(`Failed to update customer block status: ${error.message}`);
  }

  private merge(
    profiles: ProfileRow[],
    roles: { user_id: string; role: UserRole }[],
    scopes: { user_id: string; scope: AdminScope }[],
  ): AdminUserDTO[] {
    const rolesByUser = new Map<string, UserRole[]>();
    for (const row of roles) {
      const list = rolesByUser.get(row.user_id) ?? [];
      list.push(row.role);
      rolesByUser.set(row.user_id, list);
    }

    const scopesByUser = new Map<string, AdminScope[]>();
    for (const row of scopes) {
      const list = scopesByUser.get(row.user_id) ?? [];
      list.push(row.scope);
      scopesByUser.set(row.user_id, list);
    }

    return profiles.map((profile) => ({
      id: profile.id,
      fullName: profile.full_name,
      phone: profile.phone,
      roles: rolesByUser.get(profile.id) ?? [],
      adminScopes: scopesByUser.get(profile.id) ?? [],
      isBlocked: profile.is_blocked,
      createdAt: profile.created_at,
    }));
  }
}
