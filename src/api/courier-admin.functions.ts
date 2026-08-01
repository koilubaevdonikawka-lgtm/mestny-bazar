import { createServerFn } from "@tanstack/react-start";
import type { CourierAdminSummaryDTO } from "@shared/contracts/courier-status";
import type { OrderDTO } from "@shared/contracts/order";
import { uuidParamSchema } from "@shared/validation/common.schema";

export const listCouriersFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<CourierAdminSummaryDTO[]> => {
    const { executeListCouriers } = await import("@server/functions/courier-admin.executor");
    return executeListCouriers();
  },
);

export const assignCourierFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => uuidParamSchema.parse(data))
  .handler(async ({ data }): Promise<OrderDTO | null> => {
    const { executeAssignCourier } = await import("@server/functions/courier-admin.executor");
    return executeAssignCourier(data.id);
  });
