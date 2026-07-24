import { createServerFn } from "@tanstack/react-start";
import type { OrderDTO } from "@shared/contracts/order";

async function runCourier<T>(fn: () => Promise<T>): Promise<T> {
  const { mapCourierError } = await import("@server/functions/courier.executor");
  try {
    return await fn();
  } catch (e) {
    mapCourierError(e);
  }
}

export const listCourierOrdersFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<OrderDTO[]> => {
    const { executeListCourierOrders } = await import("@server/functions/courier.executor");
    return runCourier(() => executeListCourierOrders());
  },
);

export const getCourierOrderFn = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<OrderDTO> => {
    const { executeGetCourierOrder } = await import("@server/functions/courier.executor");
    return runCourier(() => executeGetCourierOrder(data.id));
  });

export const acceptCourierOrderFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<OrderDTO> => {
    const { executeAcceptCourierOrder } = await import("@server/functions/courier.executor");
    return runCourier(() => executeAcceptCourierOrder(data.id));
  });

export const startCourierDeliveryFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<OrderDTO> => {
    const { executeStartCourierDelivery } = await import("@server/functions/courier.executor");
    return runCourier(() => executeStartCourierDelivery(data.id));
  });

export const markCourierArrivalFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<OrderDTO> => {
    const { executeMarkCourierArrival } = await import("@server/functions/courier.executor");
    return runCourier(() => executeMarkCourierArrival(data.id));
  });

export const completeCourierDeliveryFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<OrderDTO> => {
    const { executeCompleteCourierDelivery } = await import("@server/functions/courier.executor");
    return runCourier(() => executeCompleteCourierDelivery(data.id));
  });
