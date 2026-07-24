export interface CheckoutValidationIssue {
  readonly field: string;
  readonly message: string;
}

export interface CheckoutValidationResult {
  readonly valid: boolean;
  readonly issues: readonly CheckoutValidationIssue[];
}
