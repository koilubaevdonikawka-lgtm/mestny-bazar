import { createServerFn } from "@tanstack/react-start";
import type { PaymentStatusCheckDTO } from "@shared/contracts/payment";
import { checkPaymentStatusRequestSchema } from "@shared/validation/payment.schema";

export const checkPaymentStatusFn = createServerFn({ method: "GET" })
  .validator((data: unknown) => checkPaymentStatusRequestSchema.parse(data))
  .handler(async ({ data }): Promise<PaymentStatusCheckDTO> => {
    const { executeCheckPaymentStatus } = await import("@server/functions/payment.executor");
    return executeCheckPaymentStatus(data.orderId);
  });
