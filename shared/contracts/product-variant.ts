import type { ProductPublicationStatus } from "@shared/contracts/seller-product";

/**
 * Product variants architecture (Stage 13). A variant belongs to exactly
 * one product and carries its own sku/price/image/publicationStatus; its
 * characteristic set (color, size, ...) is assigned separately via
 * VariantAttributeValueDTO, reusing Stage 12's attribute catalog. No UI,
 * variant selection, or stock is implemented this stage.
 */
export interface ProductVariantDTO {
  id: string;
  productId: string;
  sku: string;
  /** null = inherits the parent product's price. */
  price: number | null;
  /** null = inherits the parent product's image. */
  imageUrl: string | null;
  publicationStatus: ProductPublicationStatus;
  sortOrder: number;
}

export interface CreateProductVariantRequest {
  productId: string;
  sku: string;
  price?: number | null;
  imageUrl?: string | null;
  publicationStatus?: ProductPublicationStatus;
  sortOrder?: number;
}

export interface UpdateProductVariantRequest {
  id: string;
  sku?: string;
  price?: number | null;
  imageUrl?: string | null;
  publicationStatus?: ProductPublicationStatus;
  sortOrder?: number;
}

/** A variant's own characteristic assignment — same shape as ProductAttributeValueDTO (catalog.ts's sibling, Stage 12), keyed by variantId instead of productId. */
export interface VariantAttributeValueDTO {
  id: string;
  variantId: string;
  attributeId: string;
  valueText: string | null;
  valueNumber: number | null;
  valueBoolean: boolean | null;
  attributeValueId: string | null;
}

export interface SetVariantAttributeValueRequest {
  variantId: string;
  attributeId: string;
  valueText?: string | null;
  valueNumber?: number | null;
  valueBoolean?: boolean | null;
  attributeValueId?: string | null;
}
