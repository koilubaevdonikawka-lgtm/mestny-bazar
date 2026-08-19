import type {
  CalculateDeliveryFeeRequest,
  DeliveryFeeItemRequest,
  DeliveryFeeQuote,
} from "@shared/contracts/delivery";
import type { IProductRepository } from "@server/ports/product.repository";
import { requireAdminFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";
import { sumOrderWeightKg } from "@server/domain/delivery-calculator";
import { isUuid } from "@server/domain/shared/uuid";

/**
 * Resolves each item's real product.weightKg from the DB (never a
 * client-supplied number, CD-01) — mirrors checkout.service.ts's
 * resolveLineItems id/slug resolution shape. An item that fails to resolve
 * (bad slug, deleted product) contributes 0 kg here — this is only a
 * pre-checkout preview; the real order's own resolveLineItems independently
 * validates every item and would reject the checkout outright if one is
 * unresolvable, so this can never under-charge the actual order.
 */
async function resolveTotalWeightKg(
  items: DeliveryFeeItemRequest[],
  products: IProductRepository,
): Promise<number> {
  const ids: string[] = [];
  const slugs: string[] = [];
  for (const item of items) {
    if (item.productId?.trim() && isUuid(item.productId)) {
      ids.push(item.productId.trim());
    } else if (item.productSlug?.trim()) {
      slugs.push(item.productSlug.trim());
    }
  }

  const [byId, bySlug] = await Promise.all([
    ids.length ? products.getManyByIds(ids) : Promise.resolve([]),
    slugs.length ? products.getManyBySlugs(slugs) : Promise.resolve([]),
  ]);
  const idMap = new Map(byId.map((product) => [product.id, product]));
  const slugMap = new Map(bySlug.map((product) => [product.slug, product]));

  return sumOrderWeightKg(
    items.map((item) => {
      const useId = !!(item.productId?.trim() && isUuid(item.productId));
      const product = useId
        ? idMap.get(item.productId!.trim())
        : slugMap.get(item.productSlug?.trim() ?? "");
      return { weightKg: product?.weightKg ?? null, quantity: item.quantity };
    }),
  );
}

/** Buyer-facing — anonymous, same trust model as listActiveBanners (design.md). Price always recomputed server-side (CD-01). */
export async function executeCalculateDeliveryFee(
  data: CalculateDeliveryFeeRequest,
): Promise<DeliveryFeeQuote> {
  const totalWeightKg = data.items?.length
    ? await resolveTotalWeightKg(data.items, getServices().catalogProducts)
    : 0;
  return getServices().deliveryPricingEngine.calculate({
    zoneId: data.zoneId,
    subtotal: data.subtotal,
    totalWeightKg,
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
  const totalWeightKg = data.items?.length
    ? await resolveTotalWeightKg(data.items, getServices().catalogProducts)
    : 0;
  return getServices().deliveryPricingEngine.calculate({
    zoneId: data.zoneId,
    subtotal: data.subtotal,
    totalWeightKg,
    orderDate: data.orderDate,
  });
}
