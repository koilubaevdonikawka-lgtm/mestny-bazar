import type { CheckoutCartLine } from "@server/application/modules/checkout/checkout/models";

export interface ProductVerificationResult {
  readonly valid: boolean;
  readonly issues: readonly ProductVerificationIssue[];
}

export interface ProductVerificationIssue {
  readonly productId: string;
  readonly message: string;
}

/** Product module contract for checkout orchestration. */
export interface IProductModule {
  verifyProductsExist(lines: readonly CheckoutCartLine[]): Promise<ProductVerificationResult>;
  verifyStock(lines: readonly CheckoutCartLine[]): Promise<ProductVerificationResult>;
  verifyPrices(lines: readonly CheckoutCartLine[]): Promise<ProductVerificationResult>;
}
