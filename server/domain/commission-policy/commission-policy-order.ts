/** Named execution order for commission policy rules (ascending). */
export const CommissionPolicyOrder = {
  FLAT: 10,
} as const;

/** finance.md — platform default when no admin-configured Settings override exists. */
export const DEFAULT_COMMISSION_RATE = 0.1;
