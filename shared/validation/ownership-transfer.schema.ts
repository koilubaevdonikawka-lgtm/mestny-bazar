import { z } from "zod";

export const initiateOwnershipTransferRequestSchema = z.object({
  targetUserId: z.string().uuid(),
  fullHandover: z.boolean(),
});

export const ownershipTransferIdParamSchema = z.object({ id: z.string().uuid() });
