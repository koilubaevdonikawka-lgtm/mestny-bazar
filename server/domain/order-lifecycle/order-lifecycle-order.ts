/** Named execution order for order lifecycle rules (ascending). */
export const OrderLifecycleOrder = {
  GLOBAL_GUARD: 10,
  AUTHORITY: 20,
  TRANSITION_MATRIX: 30,
  ROLE_PERMISSION: 40,
  PAYMENT_GATE: 50,
  FINAL: 90,
} as const;
