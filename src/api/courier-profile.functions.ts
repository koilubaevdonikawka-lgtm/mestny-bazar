import { createServerFn } from "@tanstack/react-start";
import type {
  BulkSetCourierProfileStatusRequest,
  CourierProfileDTO,
  UpdateCourierProfileRequest,
} from "@shared/contracts/courier-profile";
import type { OrderListParams, OrderListResult } from "@shared/contracts/order";
import {
  bulkSetCourierProfileStatusRequestSchema,
  courierUserIdParamSchema,
  createCourierProfileRequestSchema,
  updateCourierProfileRequestSchema,
} from "@shared/validation/courier-profile.schema";
import { z } from "zod";

export const getCourierProfileFn = createServerFn({ method: "GET" })
  .validator((data: unknown) => courierUserIdParamSchema.parse(data))
  .handler(async ({ data }): Promise<CourierProfileDTO> => {
    const { executeGetCourierProfile } = await import("@server/functions/courier-profile.executor");
    return executeGetCourierProfile(data.userId);
  });

export const createCourierFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => createCourierProfileRequestSchema.parse(data))
  .handler(async ({ data }): Promise<CourierProfileDTO> => {
    const { executeCreateCourier } = await import("@server/functions/courier-profile.executor");
    return executeCreateCourier(data);
  });

export const updateCourierProfileFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => updateCourierProfileRequestSchema.parse(data))
  .handler(async ({ data }): Promise<CourierProfileDTO> => {
    const { executeUpdateCourierProfile } =
      await import("@server/functions/courier-profile.executor");
    return executeUpdateCourierProfile(data as UpdateCourierProfileRequest);
  });

export const blockCourierFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => courierUserIdParamSchema.parse(data))
  .handler(async ({ data }): Promise<CourierProfileDTO> => {
    const { executeBlockCourier } = await import("@server/functions/courier-profile.executor");
    return executeBlockCourier(data.userId);
  });

export const unblockCourierFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => courierUserIdParamSchema.parse(data))
  .handler(async ({ data }): Promise<CourierProfileDTO> => {
    const { executeUnblockCourier } = await import("@server/functions/courier-profile.executor");
    return executeUnblockCourier(data.userId);
  });

export const bulkSetCourierStatusFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => bulkSetCourierProfileStatusRequestSchema.parse(data))
  .handler(async ({ data }): Promise<void> => {
    const { executeBulkSetCourierStatus } =
      await import("@server/functions/courier-profile.executor");
    return executeBulkSetCourierStatus(data as BulkSetCourierProfileStatusRequest);
  });

const courierOrderHistoryParamsSchema = z.object({
  userId: z.string().uuid(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(200).optional(),
});

export const listCourierOrderHistoryFn = createServerFn({ method: "GET" })
  .validator((data: unknown) => courierOrderHistoryParamsSchema.parse(data))
  .handler(async ({ data }): Promise<OrderListResult> => {
    const { executeListCourierOrderHistory } =
      await import("@server/functions/courier-profile.executor");
    const params: OrderListParams = { page: data.page, pageSize: data.pageSize };
    return executeListCourierOrderHistory(data.userId, params);
  });
