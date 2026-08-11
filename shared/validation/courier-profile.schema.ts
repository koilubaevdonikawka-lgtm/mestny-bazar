import { z } from "zod";
import { CourierProfileStatus, CourierVehicleType } from "@shared/contracts/courier-profile";

const vehicleTypeSchema = z.enum([
  CourierVehicleType.ON_FOOT,
  CourierVehicleType.BICYCLE,
  CourierVehicleType.MOTORCYCLE,
  CourierVehicleType.CAR,
  CourierVehicleType.OTHER,
]);

const statusSchema = z.enum([CourierProfileStatus.ACTIVE, CourierProfileStatus.BLOCKED]);

/** Structural/transport bounds only — mirrors seller-profile.schema.ts. */
export const createCourierProfileRequestSchema = z.object({
  userId: z.string().uuid(),
  lastName: z.string().trim().min(1).max(200),
  firstName: z.string().trim().min(1).max(200),
  middleName: z.string().trim().max(200).nullable().optional(),
  phone: z.string().trim().min(5).max(30),
  vehicleType: vehicleTypeSchema.optional(),
  plateNumber: z.string().trim().max(50).nullable().optional(),
  serviceZoneId: z.string().uuid().nullable().optional(),
  hiredAt: z.string().trim().max(10).nullable().optional(),
  adminComment: z.string().trim().max(2000).nullable().optional(),
  photoUrl: z.string().trim().max(2000).nullable().optional(),
});

export const updateCourierProfileRequestSchema = createCourierProfileRequestSchema
  .omit({ userId: true })
  .partial()
  .extend({ userId: z.string().uuid() });

export const setCourierProfileStatusRequestSchema = z.object({
  userId: z.string().uuid(),
  status: statusSchema,
});

export const bulkSetCourierProfileStatusRequestSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1).max(500),
  status: statusSchema,
});

export const courierUserIdParamSchema = z.object({ userId: z.string().uuid() });
