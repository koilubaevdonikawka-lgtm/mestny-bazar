import { createServerFn } from "@tanstack/react-start";
import type { DeliveryZoneDTO } from "@shared/contracts/delivery";
import {
  createDeliveryZoneRequestSchema,
  updateDeliveryZoneRequestSchema,
} from "@shared/validation/delivery.schema";
import { z } from "zod";

export const listDeliveryZonesFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<DeliveryZoneDTO[]> => {
    const { executeListDeliveryZones } = await import("@server/functions/delivery-zone.executor");
    return executeListDeliveryZones();
  },
);

export const listAdminDeliveryZonesFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<DeliveryZoneDTO[]> => {
    const { executeListAdminDeliveryZones } =
      await import("@server/functions/delivery-zone.executor");
    return executeListAdminDeliveryZones();
  },
);

export const createDeliveryZoneFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => createDeliveryZoneRequestSchema.parse(data))
  .handler(async ({ data }): Promise<DeliveryZoneDTO> => {
    const { executeCreateDeliveryZone } = await import("@server/functions/delivery-zone.executor");
    return executeCreateDeliveryZone(data);
  });

export const updateDeliveryZoneFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => updateDeliveryZoneRequestSchema.parse(data))
  .handler(async ({ data }): Promise<DeliveryZoneDTO> => {
    const { executeUpdateDeliveryZone } = await import("@server/functions/delivery-zone.executor");
    return executeUpdateDeliveryZone(data);
  });

export const deactivateDeliveryZoneFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }): Promise<DeliveryZoneDTO> => {
    const { executeDeactivateDeliveryZone } =
      await import("@server/functions/delivery-zone.executor");
    return executeDeactivateDeliveryZone(data.id);
  });
