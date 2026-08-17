import type { IRbacRepository } from "@server/ports/rbac.repository";
import type {
  CreatePermissionRequest,
  CreateRoleRequest,
  RbacAction,
  RbacModule,
  RbacPermissionDTO,
  RbacRoleDTO,
  RoleWithPermissionsDTO,
  UpdatePermissionRequest,
  UpdateRoleRequest,
  UserRoleAssignmentDTO,
} from "@shared/contracts/rbac";
import { supabaseAdmin } from "@server/adapters/supabase/client";

interface RoleRow {
  id: string;
  name: string;
  description: string | null;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

interface PermissionRow {
  id: string;
  module: string;
  action: string;
  description: string | null;
  is_system: boolean;
  created_at: string;
}

function mapRoleRow(row: RoleRow): RbacRoleDTO {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    isSystem: row.is_system,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPermissionRow(row: PermissionRow): RbacPermissionDTO {
  return {
    id: row.id,
    module: row.module,
    action: row.action,
    description: row.description,
    isSystem: row.is_system,
    createdAt: row.created_at,
  };
}

const ROLE_SELECT = "id, name, description, is_system, created_at, updated_at";
const PERMISSION_SELECT = "id, module, action, description, is_system, created_at";

export class SupabaseRbacRepository implements IRbacRepository {
  async listRoles(): Promise<RbacRoleDTO[]> {
    const { data, error } = await supabaseAdmin
      .from("rbac_roles")
      .select(ROLE_SELECT)
      .order("name", { ascending: true });

    if (error) throw new Error(`Failed to list RBAC roles: ${error.message}`);
    return (data ?? []).map(mapRoleRow);
  }

  async getRole(id: string): Promise<RoleWithPermissionsDTO | null> {
    const { data: role, error: roleError } = await supabaseAdmin
      .from("rbac_roles")
      .select(ROLE_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (roleError) throw new Error(`Failed to fetch RBAC role: ${roleError.message}`);
    if (!role) return null;

    const { data: links, error: linksError } = await supabaseAdmin
      .from("rbac_role_permissions")
      .select(
        "permission_id, rbac_permissions(id, module, action, description, is_system, created_at)",
      )
      .eq("role_id", id);

    if (linksError) throw new Error(`Failed to fetch role permissions: ${linksError.message}`);

    const permissions = (links ?? [])
      .map((link) => link.rbac_permissions as unknown as PermissionRow | null)
      .filter((row): row is PermissionRow => row !== null)
      .map(mapPermissionRow);

    return { ...mapRoleRow(role), permissions };
  }

  async createRole(data: CreateRoleRequest): Promise<RbacRoleDTO> {
    const { data: row, error } = await supabaseAdmin
      .from("rbac_roles")
      .insert({ name: data.name, description: data.description ?? null })
      .select(ROLE_SELECT)
      .single();

    if (error || !row)
      throw new Error(`Failed to create RBAC role: ${error?.message ?? "unknown"}`);
    return mapRoleRow(row);
  }

  async updateRole(data: UpdateRoleRequest): Promise<RbacRoleDTO> {
    const patch: { name?: string; description?: string | null } = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.description !== undefined) patch.description = data.description;

    const { data: row, error } = await supabaseAdmin
      .from("rbac_roles")
      .update(patch)
      .eq("id", data.id)
      .select(ROLE_SELECT)
      .single();

    if (error || !row)
      throw new Error(`Failed to update RBAC role: ${error?.message ?? "unknown"}`);
    return mapRoleRow(row);
  }

  async deleteRole(id: string): Promise<void> {
    const { error } = await supabaseAdmin.from("rbac_roles").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete RBAC role: ${error.message}`);
  }

  async listPermissions(): Promise<RbacPermissionDTO[]> {
    const { data, error } = await supabaseAdmin
      .from("rbac_permissions")
      .select(PERMISSION_SELECT)
      .order("module", { ascending: true })
      .order("action", { ascending: true });

    if (error) throw new Error(`Failed to list RBAC permissions: ${error.message}`);
    return (data ?? []).map(mapPermissionRow);
  }

  async getPermission(id: string): Promise<RbacPermissionDTO | null> {
    const { data, error } = await supabaseAdmin
      .from("rbac_permissions")
      .select(PERMISSION_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch RBAC permission: ${error.message}`);
    return data ? mapPermissionRow(data) : null;
  }

  async createPermission(data: CreatePermissionRequest): Promise<RbacPermissionDTO> {
    const { data: row, error } = await supabaseAdmin
      .from("rbac_permissions")
      .insert({ module: data.module, action: data.action, description: data.description ?? null })
      .select(PERMISSION_SELECT)
      .single();

    if (error || !row) {
      throw new Error(`Failed to create RBAC permission: ${error?.message ?? "unknown"}`);
    }
    return mapPermissionRow(row);
  }

  async updatePermission(data: UpdatePermissionRequest): Promise<RbacPermissionDTO> {
    const patch: { module?: string; action?: string; description?: string | null } = {};
    if (data.module !== undefined) patch.module = data.module;
    if (data.action !== undefined) patch.action = data.action;
    if (data.description !== undefined) patch.description = data.description;

    const { data: row, error } = await supabaseAdmin
      .from("rbac_permissions")
      .update(patch)
      .eq("id", data.id)
      .select(PERMISSION_SELECT)
      .single();

    if (error || !row) {
      throw new Error(`Failed to update RBAC permission: ${error?.message ?? "unknown"}`);
    }
    return mapPermissionRow(row);
  }

  async deletePermission(id: string): Promise<void> {
    const { error } = await supabaseAdmin.from("rbac_permissions").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete RBAC permission: ${error.message}`);
  }

  async setRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    const { error: deleteError } = await supabaseAdmin
      .from("rbac_role_permissions")
      .delete()
      .eq("role_id", roleId);

    if (deleteError) {
      throw new Error(`Failed to clear role permissions: ${deleteError.message}`);
    }
    if (permissionIds.length === 0) return;

    const { error: insertError } = await supabaseAdmin
      .from("rbac_role_permissions")
      .insert(
        permissionIds.map((permissionId) => ({ role_id: roleId, permission_id: permissionId })),
      );

    if (insertError) {
      throw new Error(`Failed to set role permissions: ${insertError.message}`);
    }
  }

  async listUserRoleAssignments(userId?: string): Promise<UserRoleAssignmentDTO[]> {
    let query = supabaseAdmin
      .from("rbac_user_roles")
      .select("user_id, role_id, assigned_at, rbac_roles(name)");

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to list role assignments: ${error.message}`);

    return (data ?? []).map((row) => ({
      userId: row.user_id,
      roleId: row.role_id,
      roleName: (row.rbac_roles as unknown as { name: string } | null)?.name ?? "",
      assignedAt: row.assigned_at,
    }));
  }

  async assignRole(userId: string, roleId: string, assignedBy: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("rbac_user_roles")
      .upsert(
        { user_id: userId, role_id: roleId, assigned_by: assignedBy },
        { onConflict: "user_id,role_id", ignoreDuplicates: true },
      );

    if (error) throw new Error(`Failed to assign RBAC role: ${error.message}`);
  }

  async revokeRole(userId: string, roleId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("rbac_user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role_id", roleId);

    if (error) throw new Error(`Failed to revoke RBAC role: ${error.message}`);
  }

  async hasPermission(
    userId: string,
    module: RbacModule | string,
    action: RbacAction | string,
  ): Promise<boolean> {
    // rbac_user_roles and rbac_role_permissions share role_id but have no
    // direct FK to each other (both point at rbac_roles) — PostgREST embed
    // resolution needs an actual FK path, so this is two queries: the
    // caller's role ids, then whether any of those roles grant this exact
    // (module, action) permission.
    const { data: userRoles, error: userRolesError } = await supabaseAdmin
      .from("rbac_user_roles")
      .select("role_id")
      .eq("user_id", userId);

    if (userRolesError) {
      throw new Error(`Failed to check RBAC permission: ${userRolesError.message}`);
    }
    const roleIds = (userRoles ?? []).map((row) => row.role_id);
    if (roleIds.length === 0) return false;

    const { data, error } = await supabaseAdmin
      .from("rbac_role_permissions")
      .select("permission_id, rbac_permissions!inner(module, action)")
      .in("role_id", roleIds)
      .eq("rbac_permissions.module", module)
      .eq("rbac_permissions.action", action)
      .limit(1);

    if (error) throw new Error(`Failed to check RBAC permission: ${error.message}`);
    return (data?.length ?? 0) > 0;
  }
}
