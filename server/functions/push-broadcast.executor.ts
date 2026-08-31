import type {
  PushBroadcastAudienceDTO,
  PushBroadcastDTO,
  SendPushBroadcastRequest,
} from "@shared/contracts/push-broadcast";
import { requireAdminFromRequest } from "@server/auth/resolve-user";
import { assertMarketingAccess } from "@server/auth/assert-marketing-access";
import { getServices } from "@server/di/container";

export async function executeGetBroadcastAudience(): Promise<PushBroadcastAudienceDTO> {
  const { userId, roles } = await requireAdminFromRequest();
  await assertMarketingAccess(userId, roles);
  return getServices().pushBroadcastService.getAudience();
}

export async function executeSendPushBroadcast(
  data: SendPushBroadcastRequest,
): Promise<PushBroadcastDTO> {
  const { userId, roles } = await requireAdminFromRequest();
  await assertMarketingAccess(userId, roles);
  return getServices().pushBroadcastService.sendBroadcast(data.title, data.body, userId);
}
