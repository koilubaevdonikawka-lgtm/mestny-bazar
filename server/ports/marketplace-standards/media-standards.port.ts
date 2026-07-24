/** Media standards — images, formats, sizes (future). */
export const MEDIA_STANDARDS_DOMAIN = "media" as const;

export interface IMediaStandards {
  readonly domain: typeof MEDIA_STANDARDS_DOMAIN;
}
