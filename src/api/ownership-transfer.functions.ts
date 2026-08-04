import { createServerFn } from "@tanstack/react-start";
import type { OwnershipTransferDTO } from "@shared/contracts/ownership-transfer";
import {
  initiateOwnershipTransferRequestSchema,
  ownershipTransferIdParamSchema,
} from "@shared/validation/ownership-transfer.schema";

export const initiateOwnershipTransferFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => initiateOwnershipTransferRequestSchema.parse(data))
  .handler(async ({ data }): Promise<OwnershipTransferDTO> => {
    const { executeInitiateOwnershipTransfer } =
      await import("@server/functions/ownership-transfer.executor");
    return executeInitiateOwnershipTransfer(data);
  });

export const acceptOwnershipTransferFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => ownershipTransferIdParamSchema.parse(data))
  .handler(async ({ data }): Promise<OwnershipTransferDTO> => {
    const { executeAcceptOwnershipTransfer } =
      await import("@server/functions/ownership-transfer.executor");
    return executeAcceptOwnershipTransfer(data.id);
  });

export const cancelOwnershipTransferFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => ownershipTransferIdParamSchema.parse(data))
  .handler(async ({ data }): Promise<OwnershipTransferDTO> => {
    const { executeCancelOwnershipTransfer } =
      await import("@server/functions/ownership-transfer.executor");
    return executeCancelOwnershipTransfer(data.id);
  });
