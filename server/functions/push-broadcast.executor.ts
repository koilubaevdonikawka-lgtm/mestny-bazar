import type {
  PushBroadcastAudienceDTO,
  PushBroadcastDTO,
  SendPushBroadcastRequest,
} from "@shared/contracts/push-broadcast";
import type { UserRole } from "@shared/contracts/user";
import { requireAdminFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";

const MODULE = "marketing";

/**
 * Задача №218 — a mass push to every customer at once is a materially
 * higher-blast-radius action than the coupon/banner CRUD this module also
 * gates, so — unlike most other MODULE="marketing" executors (a documented
 * gap, see permission-policy.port.ts) — this one uses the real three-step
 * pattern (user-admin.executor.ts): look up the acting admin's own
 * admin_scopes and actually pass them into the policy check, so a
 * finance-scoped (non-marketing) admin is genuinely denied, not just
 * nominally.
 */
async function assertBroadcastAccess(userId: string, roles: UserRole[]): Promise<void> {
  const actor = await getServices().userAdminService.getUser(userId);
  getServices().permissionPolicy.assert({
    actor: { id: userId, roles, scopes: actor?.adminScopes },
    module: MODULE,
  });
}

export async function executeGetBroadcastAudience(): Promise<PushBroadcastAudienceDTO> {
  const { userId, roles } = await requireAdminFromRequest();
  await assertBroadcastAccess(userId, roles);
  return getServices().pushBroadcastService.getAudience();
}

export async function executeSendPushBroadcast(
  data: SendPushBroadcastRequest,
): Promise<PushBroadcastDTO> {
  const { userId, roles } = await requireAdminFromRequest();
  await assertBroadcastAccess(userId, roles);
  return getServices().pushBroadcastService.sendBroadcast(data.title, data.body, userId);
}
