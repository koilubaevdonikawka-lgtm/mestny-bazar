import { createServerFn } from "@tanstack/react-start";
import type { DeliveryTariffDTO } from "@shared/contracts/delivery";
import {
  createDeliveryTariffRequestSchema,
  updateDeliveryTariffRequestSchema,
} from "@shared/validation/delivery.schema";

export const listDeliveryTariffsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<DeliveryTariffDTO[]> => {
    const { executeListDeliveryTariffs } =
      await import("@server/functions/delivery-tariff.executor");
    return executeListDeliveryTariffs();
  },
);

export const createDeliveryTariffFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => createDeliveryTariffRequestSchema.parse(data))
  .handler(async ({ data }): Promise<DeliveryTariffDTO> => {
    const { executeCreateDeliveryTariff } =
      await import("@server/functions/delivery-tariff.executor");
    return executeCreateDeliveryTariff(data);
  });

export const updateDeliveryTariffFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => updateDeliveryTariffRequestSchema.parse(data))
  .handler(async ({ data }): Promise<DeliveryTariffDTO> => {
    const { executeUpdateDeliveryTariff } =
      await import("@server/functions/delivery-tariff.executor");
    return executeUpdateDeliveryTariff(data);
  });
