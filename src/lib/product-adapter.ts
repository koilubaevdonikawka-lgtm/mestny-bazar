import type { ProductDTO } from "@shared/contracts/catalog";
import type { ShopifyProduct } from "@/lib/shopify";

/** Marks cart line identities that originate from the Platform catalog (Stage 3), not Shopify. */
export const PLATFORM_VARIANT_PREFIX = "platform:";

export function isPlatformVariantId(variantId: string): boolean {
  return variantId.startsWith(PLATFORM_VARIANT_PREFIX);
}

/**
 * Adapts a Platform ProductDTO into the ShopifyProduct shape existing product rendering and
 * cart/checkout code already understands, so switching catalog source (Stage 3) requires no
 * changes to that code.
 */
export function toShopifyProductShim(product: ProductDTO): ShopifyProduct {
  const variantId = `${PLATFORM_VARIANT_PREFIX}${product.id}`;
  const price = { amount: product.price.toFixed(2), currencyCode: product.currency };

  return {
    node: {
      id: variantId,
      title: product.name,
      description: product.description ?? "",
      handle: product.slug,
      priceRange: { minVariantPrice: price },
      images: {
        edges: product.imageUrl ? [{ node: { url: product.imageUrl, altText: product.name } }] : [],
      },
      variants: {
        edges: [
          {
            node: {
              id: variantId,
              title: product.name,
              price,
              availableForSale: product.inStock,
              selectedOptions: [],
            },
          },
        ],
      },
      options: [],
    },
  };
}
