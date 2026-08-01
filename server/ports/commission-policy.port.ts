export interface CommissionPolicyContext {
  sellerId: string;
  /**
   * Pre-fetched from Settings by the caller (PayoutService) — Settings reads
   * are async but Rule Engines stay synchronous (Принцип 12), mirroring how
   * CheckoutService pre-fetches isBlocked before calling PaymentPolicyService.
   * Null means no override is configured; the rule falls back to its own default.
   */
  settingsRate: number | null;
}

export interface CommissionPolicyResult {
  /** Fraction, e.g. 0.1 for 10%. */
  rate: number;
}

/**
 * Rule Engine standard (Принцип 12) applied to a resolution problem (always
 * produces a rate) rather than a gate — mirrors ICourierAssignmentPolicy's
 * documented deviation for selection-style engines.
 */
export interface ICommissionPolicy {
  resolveRate(context: CommissionPolicyContext): CommissionPolicyResult;
}
