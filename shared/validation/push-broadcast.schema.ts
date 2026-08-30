import { z } from "zod";

export const sendPushBroadcastRequestSchema = z.object({
  title: z.string().trim().min(2).max(80),
  body: z.string().trim().min(2).max(180),
});
