import { z } from "zod";

export const createRoleRequestSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).nullable().optional(),
});

export const updateRoleRequestSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().max(500).nullable().optional(),
});

export const createPermissionRequestSchema = z.object({
  module: z.string().trim().min(1).max(100),
  action: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).nullable().optional(),
});

export const updatePermissionRequestSchema = z.object({
  id: z.string().uuid(),
  module: z.string().trim().min(1).max(100).optional(),
  action: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(500).nullable().optional(),
});

export const setRolePermissionsRequestSchema = z.object({
  roleId: z.string().uuid(),
  permissionIds: z.array(z.string().uuid()).max(1000),
});

export const assignRoleRequestSchema = z.object({
  userId: z.string().uuid(),
  roleId: z.string().uuid(),
});

export const revokeRoleRequestSchema = z.object({
  userId: z.string().uuid(),
  roleId: z.string().uuid(),
});

export const rbacIdParamSchema = z.object({ id: z.string().uuid() });
export const rbacOptionalUserIdParamSchema = z.object({ userId: z.string().uuid().optional() });
