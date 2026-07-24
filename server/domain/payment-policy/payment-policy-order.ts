/** Named execution order for payment policy rules (ascending). */
export const PaymentPolicyOrder = {
  GLOBAL_GUARD: 10,
  BLOCKED_USER: 20,
  CORPORATE: 30,
  CITY_RULE: 40,
  CASH_AUTH: 80,
  ONLINE: 90,
} as const;
