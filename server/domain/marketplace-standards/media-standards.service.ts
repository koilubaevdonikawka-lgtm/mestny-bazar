import {
  MEDIA_STANDARDS_DOMAIN,
  type IMediaStandards,
} from "@server/ports/marketplace-standards/media-standards.port";

/** Media standards service — infrastructure placeholder. */
export class MediaStandardsService implements IMediaStandards {
  readonly domain = MEDIA_STANDARDS_DOMAIN;
}
