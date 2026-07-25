import { createServerFn } from "@tanstack/react-start";
import type { OrderDTO, OrderListParams, OrderListResult } from "@shared/contracts/order";

async function runAdmin<T>(fn: () => Promise<T>): Promise<T> {
  const { mapAdminError } = await import("@server/functions/admin.executor");
  try {
    return await fn();
  } catch (e) {
    return mapAdminError(e);
  }
}

export const listAdminOrdersFn = createServerFn({ method: "GET" })
  .validator((data: OrderListParams | undefined) => data)
  .handler(async ({ data }): Promise<OrderListResult> => {
    const { executeListAdminOrders } = await import("@server/functions/admin.executor");
    return runAdmin(() => executeListAdminOrders(data));
  });

export const getAdminOrderFn = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<OrderDTO> => {
    const { executeGetAdminOrder } = await import("@server/functions/admin.executor");
    return runAdmin(() => executeGetAdminOrder(data.id));
  });

export const confirmAdminOrderFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<OrderDTO> => {
    const { executeConfirmAdminOrder } = await import("@server/functions/admin.executor");
    return runAdmin(() => executeConfirmAdminOrder(data.id));
  });

export const cancelAdminOrderFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<OrderDTO> => {
    const { executeCancelAdminOrder } = await import("@server/functions/admin.executor");
    return runAdmin(() => executeCancelAdminOrder(data.id));
  });
