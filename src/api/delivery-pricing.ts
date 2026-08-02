import type { CalculateDeliveryFeeRequest, DeliveryFeeQuote } from "@shared/contracts/delivery";
import { calculateDeliveryFeeFn, previewDeliveryFeeFn } from "@/api/delivery-pricing.functions";

export async function calculateDeliveryFee(
  request: CalculateDeliveryFeeRequest,
): Promise<DeliveryFeeQuote> {
  return calculateDeliveryFeeFn({ data: request });
}

export async function previewDeliveryFee(
  request: CalculateDeliveryFeeRequest & { orderDate?: string },
): Promise<DeliveryFeeQuote> {
  return previewDeliveryFeeFn({ data: request });
}
