import type { AdminScope, AdminUserDTO } from "@shared/contracts/user-admin";
import type { UserRole } from "@shared/contracts/user";

export interface IUserAdminRepository {
  listUsers(): Promise<AdminUserDTO[]>;
  getById(userId: string): Promise<AdminUserDTO | null>;
  assignRole(userId: string, role: UserRole): Promise<void>;
  revokeRole(userId: string, role: UserRole): Promise<void>;
  assignScope(userId: string, scope: AdminScope): Promise<void>;
  revokeScope(userId: string, scope: AdminScope): Promise<void>;
  setBlocked(userId: string, isBlocked: boolean): Promise<void>;
}
