import { createServerFn } from "@tanstack/react-start";
import type { OrderDTO } from "@shared/contracts/order";
import type { CourierStatusDTO } from "@shared/contracts/courier-status";
import { uuidParamSchema } from "@shared/validation/common.schema";
import { setCourierAvailabilityRequestSchema } from "@shared/validation/courier-status.schema";

export const listCourierOrdersFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<OrderDTO[]> => {
    const { executeListCourierOrders } = await import("@server/functions/courier.executor");
    return executeListCourierOrders();
  },
);

export const getCourierOrderFn = createServerFn({ method: "GET" })
  .validator((data: unknown) => uuidParamSchema.parse(data))
  .handler(async ({ data }): Promise<OrderDTO> => {
    const { executeGetCourierOrder } = await import("@server/functions/courier.executor");
    return executeGetCourierOrder(data.id);
  });

export const acceptCourierOrderFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => uuidParamSchema.parse(data))
  .handler(async ({ data }): Promise<OrderDTO> => {
    const { executeAcceptCourierOrder } = await import("@server/functions/courier.executor");
    return executeAcceptCourierOrder(data.id);
  });

export const startCourierDeliveryFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => uuidParamSchema.parse(data))
  .handler(async ({ data }): Promise<OrderDTO> => {
    const { executeStartCourierDelivery } = await import("@server/functions/courier.executor");
    return executeStartCourierDelivery(data.id);
  });

export const markCourierArrivalFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => uuidParamSchema.parse(data))
  .handler(async ({ data }): Promise<OrderDTO> => {
    const { executeMarkCourierArrival } = await import("@server/functions/courier.executor");
    return executeMarkCourierArrival(data.id);
  });

export const completeCourierDeliveryFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => uuidParamSchema.parse(data))
  .handler(async ({ data }): Promise<OrderDTO> => {
    const { executeCompleteCourierDelivery } = await import("@server/functions/courier.executor");
    return executeCompleteCourierDelivery(data.id);
  });

export const setCourierAvailabilityFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => setCourierAvailabilityRequestSchema.parse(data))
  .handler(async ({ data }): Promise<CourierStatusDTO> => {
    const { executeSetCourierAvailability } = await import("@server/functions/courier.executor");
    return executeSetCourierAvailability(data.isAvailable);
  });
