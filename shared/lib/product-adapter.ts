import type { ProductDTO } from "@shared/contracts/catalog";

/** Marks cart line identities that originate from the Platform catalog. */
export const PLATFORM_VARIANT_PREFIX = "platform:";

export function isPlatformVariantId(variantId: string): boolean {
  return variantId.startsWith(PLATFORM_VARIANT_PREFIX);
}

/**
 * Product rendering, cart, and checkout code across the buyer PWA share this
 * shape (title/handle/priceRange/images/variants) — a legacy naming carried
 * over from the pre-ADR-002 Shopify Storefront API era, kept because dozens
 * of components already understand it and Supabase is now the only producer
 * of this shape (see ADR-002).
 */
export interface CatalogProductNode {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
    priceRange: {
      minVariantPrice: { amount: string; currencyCode: string };
    };
    images: {
      edges: Array<{ node: { url: string; altText: string | null } }>;
    };
    variants: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          price: { amount: string; currencyCode: string };
          availableForSale: boolean;
          selectedOptions: Array<{ name: string; value: string }>;
        };
      }>;
    };
    options: Array<{ name: string; values: string[] }>;
  };
}

/** Adapts a Platform ProductDTO into the CatalogProductNode shape product rendering and cart/checkout code understand. */
export function toCatalogProductNode(product: ProductDTO): CatalogProductNode {
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
