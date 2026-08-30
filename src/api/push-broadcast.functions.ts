import { createServerFn } from "@tanstack/react-start";
import type { PushBroadcastAudienceDTO, PushBroadcastDTO } from "@shared/contracts/push-broadcast";
import { sendPushBroadcastRequestSchema } from "@shared/validation/push-broadcast.schema";

export const getBroadcastAudienceFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<PushBroadcastAudienceDTO> => {
    const { executeGetBroadcastAudience } =
      await import("@server/functions/push-broadcast.executor");
    return executeGetBroadcastAudience();
  },
);

export const sendPushBroadcastFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => sendPushBroadcastRequestSchema.parse(data))
  .handler(async ({ data }): Promise<PushBroadcastDTO> => {
    const { executeSendPushBroadcast } = await import("@server/functions/push-broadcast.executor");
    return executeSendPushBroadcast(data);
  });
