import type { IUserAdminRepository } from "@server/ports/user-admin.repository";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import type { AdminScope, AdminUserDTO } from "@shared/contracts/user-admin";
import type { UserRole } from "@shared/contracts/user";

/**
 * Single service for role assignment across every role (permissions.md §"Назначение
 * ролей пользователям") and for customer blocking (users.md) — one place, not
 * duplicated per role, per the same table (user_roles) and the same profiles row
 * regardless of which role is being granted/revoked or which user is being blocked.
 */
export class UserAdminService {
  constructor(
    private readonly users: IUserAdminRepository,
    private readonly events: IMarketplaceEventBus,
  ) {}

  async listUsers(): Promise<AdminUserDTO[]> {
    return this.users.listUsers();
  }

  async getUser(userId: string): Promise<AdminUserDTO | null> {
    return this.users.getById(userId);
  }

  async assignRole(userId: string, role: UserRole): Promise<void> {
    await this.users.assignRole(userId, role);
    await this.events.publish({ type: "role.assigned", userId, role });
  }

  async revokeRole(userId: string, role: UserRole): Promise<void> {
    await this.users.revokeRole(userId, role);
    await this.events.publish({ type: "role.revoked", userId, role });
  }

  async assignScope(userId: string, scope: AdminScope): Promise<void> {
    await this.users.assignScope(userId, scope);
    await this.events.publish({ type: "permission.changed", userId, scope, action: "assigned" });
  }

  async revokeScope(userId: string, scope: AdminScope): Promise<void> {
    await this.users.revokeScope(userId, scope);
    await this.events.publish({ type: "permission.changed", userId, scope, action: "revoked" });
  }

  async blockCustomer(userId: string): Promise<void> {
    await this.users.setBlocked(userId, true);
    await this.events.publish({ type: "customer.blocked", userId });
  }

  async unblockCustomer(userId: string): Promise<void> {
    await this.users.setBlocked(userId, false);
    await this.events.publish({ type: "customer.unblocked", userId });
  }
}
