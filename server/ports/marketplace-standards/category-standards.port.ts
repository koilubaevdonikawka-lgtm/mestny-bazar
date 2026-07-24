/** Category standards — taxonomy, assignment rules (future). */
export const CATEGORY_STANDARDS_DOMAIN = "category" as const;

export interface ICategoryStandards {
  readonly domain: typeof CATEGORY_STANDARDS_DOMAIN;
}
