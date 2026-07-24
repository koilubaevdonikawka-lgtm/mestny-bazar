/** Checkout snapshot for workflow validation. */
export interface CheckoutWorkflowSnapshot {
  readonly checkoutId: string;
  readonly customerId: string;
  readonly ready: boolean;
  readonly valid: boolean;
}

/**
 * Read-only checkout access for workflow orchestration.
 * Implemented by an adapter over Checkout Management Application Service.
 */
export interface ICheckoutWorkflowReader {
  validateForOrder(customerId: string, checkoutId: string): Promise<CheckoutWorkflowSnapshot>;
}
