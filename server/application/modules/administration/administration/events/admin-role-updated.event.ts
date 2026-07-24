import type { AdminRole } from "@server/application/modules/administration/administration/models";

export interface AdminRoleUpdatedEvent {
  readonly type: "administration.admin_role.updated";
  readonly role: AdminRole;
  readonly occurredAt: string;
}

export function createAdminRoleUpdatedEvent(role: AdminRole): AdminRoleUpdatedEvent {
  return Object.freeze({
    type: "administration.admin_role.updated",
    role,
    occurredAt: new Date().toISOString(),
  });
}
