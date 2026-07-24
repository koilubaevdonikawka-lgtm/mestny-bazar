import {
  CONTENT_STANDARDS_DOMAIN,
  type IContentStandards,
} from "@server/ports/marketplace-standards/content-standards.port";

/** Content standards service — infrastructure placeholder. */
export class ContentStandardsService implements IContentStandards {
  readonly domain = CONTENT_STANDARDS_DOMAIN;
}
