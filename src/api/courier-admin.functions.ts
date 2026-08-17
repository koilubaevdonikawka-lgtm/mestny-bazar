import { createServerFn } from "@tanstack/react-start";
import type { CourierListItemDTO } from "@shared/contracts/courier-profile";
import type { OrderDTO } from "@shared/contracts/order";
import { uuidParamSchema } from "@shared/validation/common.schema";

export const listCouriersFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<CourierListItemDTO[]> => {
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
