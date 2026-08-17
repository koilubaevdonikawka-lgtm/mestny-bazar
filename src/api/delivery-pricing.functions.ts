import { createServerFn } from "@tanstack/react-start";
import type { DeliveryFeeQuote } from "@shared/contracts/delivery";
import {
  calculateDeliveryFeeRequestSchema,
  previewDeliveryFeeRequestSchema,
} from "@shared/validation/delivery.schema";

export const calculateDeliveryFeeFn = createServerFn({ method: "GET" })
  .validator((data: unknown) => calculateDeliveryFeeRequestSchema.parse(data))
  .handler(async ({ data }): Promise<DeliveryFeeQuote> => {
    const { executeCalculateDeliveryFee } =
      await import("@server/functions/delivery-pricing.executor");
    return executeCalculateDeliveryFee(data);
  });

export const previewDeliveryFeeFn = createServerFn({ method: "GET" })
  .validator((data: unknown) => previewDeliveryFeeRequestSchema.parse(data))
  .handler(async ({ data }): Promise<DeliveryFeeQuote> => {
    const { executePreviewDeliveryFee } =
      await import("@server/functions/delivery-pricing.executor");
    return executePreviewDeliveryFee(data);
  });
