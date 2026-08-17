import { z } from "zod";

const userRoleSchema = z.enum(["admin", "customer", "warehouse", "courier", "seller"]);
const adminScopeSchema = z.enum(["finance", "marketing"]);

export const assignRoleRequestSchema = z.object({
  userId: z.string().uuid(),
  role: userRoleSchema,
});

export const revokeRoleRequestSchema = z.object({
  userId: z.string().uuid(),
  role: userRoleSchema,
});

export const assignAdminScopeRequestSchema = z.object({
  userId: z.string().uuid(),
  scope: adminScopeSchema,
});

export const revokeAdminScopeRequestSchema = z.object({
  userId: z.string().uuid(),
  scope: adminScopeSchema,
});

export const setCustomerBlockedRequestSchema = z.object({
  userId: z.string().uuid(),
  isBlocked: z.boolean(),
});
