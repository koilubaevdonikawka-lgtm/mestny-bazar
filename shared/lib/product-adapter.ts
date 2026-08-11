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
    /** Platform-native fields with no Shopify-shape equivalent — added for
     * the product detail page (Stage 5). Absent/unset source data maps to
     * `null`, never a fabricated value. */
    unit: string | null;
    manufacturer: string | null;
    countryOfOrigin: string | null;
    stock: number;
    inStock: boolean;
    category: { id: string; name: string; slug: string } | null;
  };
}

/** Adapts a Platform ProductDTO into the CatalogProductNode shape product rendering and cart/checkout code understand. */
export function toCatalogProductNode(product: ProductDTO): CatalogProductNode {
  const variantId = `${PLATFORM_VARIANT_PREFIX}${product.id}`;
  const price = { amount: product.price.toFixed(2), currencyCode: product.currency };
  // Full gallery when available; falls back to the single legacy image_url
  // column so products saved before image_urls existed still render.
  const galleryUrls =
    product.imageUrls.length > 0 ? product.imageUrls : product.imageUrl ? [product.imageUrl] : [];

  return {
    node: {
      id: variantId,
      title: product.name,
      description: product.description ?? "",
      handle: product.slug,
      priceRange: { minVariantPrice: price },
      images: {
        edges: galleryUrls.map((url) => ({ node: { url, altText: product.name } })),
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
      unit: product.unit,
      manufacturer: product.manufacturer,
      countryOfOrigin: product.countryOfOrigin,
      stock: product.stock,
      inStock: product.inStock,
      category: product.category ?? null,
    },
  };
}
