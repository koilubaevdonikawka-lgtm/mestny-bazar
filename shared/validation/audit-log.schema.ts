import { z } from "zod";
import { pageSchema, pageSizeSchema } from "./common.schema";

export const auditLogListParamsSchema = z
  .object({
    action: z.string().trim().max(100).optional(),
    entityType: z.string().trim().max(100).optional(),
    entityId: z.string().trim().max(200).optional(),
    actorId: z.string().trim().max(200).optional(),
    periodStart: z.string().trim().max(40).optional(),
    periodEnd: z.string().trim().max(40).optional(),
    page: pageSchema.optional(),
    pageSize: pageSizeSchema.optional(),
  })
  .optional();
