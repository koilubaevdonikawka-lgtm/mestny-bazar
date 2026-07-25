import { createServerFn } from "@tanstack/react-start";
import type { OrderDTO } from "@shared/contracts/order";

export const listCourierOrdersFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<OrderDTO[]> => {
    const { executeListCourierOrders } = await import("@server/functions/courier.executor");
    return executeListCourierOrders();
  },
);

export const getCourierOrderFn = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<OrderDTO> => {
    const { executeGetCourierOrder } = await import("@server/functions/courier.executor");
    return executeGetCourierOrder(data.id);
  });

export const acceptCourierOrderFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<OrderDTO> => {
    const { executeAcceptCourierOrder } = await import("@server/functions/courier.executor");
    return executeAcceptCourierOrder(data.id);
  });

export const startCourierDeliveryFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<OrderDTO> => {
    const { executeStartCourierDelivery } = await import("@server/functions/courier.executor");
    return executeStartCourierDelivery(data.id);
  });

export const markCourierArrivalFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<OrderDTO> => {
    const { executeMarkCourierArrival } = await import("@server/functions/courier.executor");
    return executeMarkCourierArrival(data.id);
  });

export const completeCourierDeliveryFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<OrderDTO> => {
    const { executeCompleteCourierDelivery } = await import("@server/functions/courier.executor");
    return executeCompleteCourierDelivery(data.id);
  });
