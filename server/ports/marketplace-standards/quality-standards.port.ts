/** Quality standards — listing quality gates (future). */
export const QUALITY_STANDARDS_DOMAIN = "quality" as const;

export interface IQualityStandards {
  readonly domain: typeof QUALITY_STANDARDS_DOMAIN;
}
