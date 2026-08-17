import { createServerFn } from "@tanstack/react-start";
import type { OrderDTO, OrderListResult } from "@shared/contracts/order";
import { orderListParamsSchema } from "@shared/validation/order.schema";
import { uuidParamSchema } from "@shared/validation/common.schema";

export const listAdminOrdersFn = createServerFn({ method: "GET" })
  .validator((data: unknown) => orderListParamsSchema.parse(data))
  .handler(async ({ data }): Promise<OrderListResult> => {
    const { executeListAdminOrders } = await import("@server/functions/admin.executor");
    return executeListAdminOrders(data);
  });

export const getAdminOrderFn = createServerFn({ method: "GET" })
  .validator((data: unknown) => uuidParamSchema.parse(data))
  .handler(async ({ data }): Promise<OrderDTO> => {
    const { executeGetAdminOrder } = await import("@server/functions/admin.executor");
    return executeGetAdminOrder(data.id);
  });

export const confirmAdminOrderFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => uuidParamSchema.parse(data))
  .handler(async ({ data }): Promise<OrderDTO> => {
    const { executeConfirmAdminOrder } = await import("@server/functions/admin.executor");
    return executeConfirmAdminOrder(data.id);
  });

export const cancelAdminOrderFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => uuidParamSchema.parse(data))
  .handler(async ({ data }): Promise<OrderDTO> => {
    const { executeCancelAdminOrder } = await import("@server/functions/admin.executor");
    return executeCancelAdminOrder(data.id);
  });
