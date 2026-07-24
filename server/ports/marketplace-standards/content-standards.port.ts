/** Content standards — titles, descriptions, copy rules (future). */
export const CONTENT_STANDARDS_DOMAIN = "content" as const;

export interface IContentStandards {
  readonly domain: typeof CONTENT_STANDARDS_DOMAIN;
}
