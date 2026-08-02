import type { CalculateDeliveryFeeRequest, DeliveryFeeQuote } from "@shared/contracts/delivery";
import { requireAdminFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";

/** Buyer-facing — anonymous, same trust model as listActiveBanners (design.md). Price always recomputed server-side (CD-01). */
export async function executeCalculateDeliveryFee(
  data: CalculateDeliveryFeeRequest,
): Promise<DeliveryFeeQuote> {
  return getServices().deliveryPricingEngine.calculate({
    zoneId: data.zoneId,
    subtotal: data.subtotal,
  });
}

export interface PreviewDeliveryFeeRequest extends CalculateDeliveryFeeRequest {
  /** Lets an admin preview a future/past date — e.g. a holiday tariff not yet in its window. */
  orderDate?: string;
}

/** Admin-facing — docs/delivery/delivery-api.md "Delivery Preview API". Reuses the same DeliveryPricingEngine, no duplicate calculation. */
export async function executePreviewDeliveryFee(
  data: PreviewDeliveryFeeRequest,
): Promise<DeliveryFeeQuote> {
  await requireAdminFromRequest();
  return getServices().deliveryPricingEngine.calculate({
    zoneId: data.zoneId,
    subtotal: data.subtotal,
    orderDate: data.orderDate,
  });
}
