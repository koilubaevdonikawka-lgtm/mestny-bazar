/** Business standards — pricing, seller eligibility (future). */
export const BUSINESS_STANDARDS_DOMAIN = "business" as const;

export interface IBusinessStandards {
  readonly domain: typeof BUSINESS_STANDARDS_DOMAIN;
}
