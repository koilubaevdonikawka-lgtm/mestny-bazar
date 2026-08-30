import type {
  PushBroadcastAudienceDTO,
  PushBroadcastDTO,
  SendPushBroadcastRequest,
} from "@shared/contracts/push-broadcast";
import { getBroadcastAudienceFn, sendPushBroadcastFn } from "@/api/push-broadcast.functions";

export async function getBroadcastAudience(): Promise<PushBroadcastAudienceDTO> {
  return getBroadcastAudienceFn();
}

export async function sendPushBroadcast(
  request: SendPushBroadcastRequest,
): Promise<PushBroadcastDTO> {
  return sendPushBroadcastFn({ data: request });
}
