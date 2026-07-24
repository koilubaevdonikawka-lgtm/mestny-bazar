import type { CatalogProductCard } from "@server/application/catalog-management/models/catalog-product.model";

export interface CartItemView {
  readonly productId: string;
  readonly quantity: number;
  readonly product: CatalogProductCard | null;
  readonly unitPrice: number;
  readonly currency: string;
  readonly lineTotal: number;
}

export interface CartView {
  readonly items: readonly CartItemView[];
  readonly itemCount: number;
}

export interface CartTotalResult {
  readonly subtotal: number;
  readonly currency: string;
  readonly itemCount: number;
}

export interface CartValidationIssue {
  readonly productId: string;
  readonly message: string;
}

export interface CartValidationResult {
  readonly valid: boolean;
  readonly issues: readonly CartValidationIssue[];
}

export interface ClearCartResult {
  readonly removed: number;
}

export interface RemoveCartItemResult {
  readonly removed: boolean;
}
