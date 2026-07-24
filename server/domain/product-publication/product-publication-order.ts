/** Named execution order for product publication rules (ascending). */
export const ProductPublicationOrder = {
  GLOBAL_GUARD: 10,
  TRANSITION_MATRIX: 30,
  ROLE_PERMISSION: 40,
  FINAL: 90,
} as const;
