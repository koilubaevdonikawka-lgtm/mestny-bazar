import { createServerFn } from "@tanstack/react-start";
import type { OrderDTO } from "@shared/contracts/order";

async function runWarehouse<T>(fn: () => Promise<T>): Promise<T> {
  const { mapWarehouseError } = await import("@server/functions/warehouse.executor");
  try {
    return await fn();
  } catch (e) {
    return mapWarehouseError(e);
  }
}

export const listWarehouseOrdersFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<OrderDTO[]> => {
    const { executeListWarehouseOrders } = await import("@server/functions/warehouse.executor");
    return runWarehouse(() => executeListWarehouseOrders());
  },
);

export const getWarehouseOrderFn = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<OrderDTO> => {
    const { executeGetWarehouseOrder } = await import("@server/functions/warehouse.executor");
    return runWarehouse(() => executeGetWarehouseOrder(data.id));
  });

export const startWarehouseAssemblyFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<OrderDTO> => {
    const { executeStartWarehouseAssembly } = await import("@server/functions/warehouse.executor");
    return runWarehouse(() => executeStartWarehouseAssembly(data.id));
  });

export const completeWarehouseAssemblyFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<OrderDTO> => {
    const { executeCompleteWarehouseAssembly } = await import("@server/functions/warehouse.executor");
    return runWarehouse(() => executeCompleteWarehouseAssembly(data.id));
  });
