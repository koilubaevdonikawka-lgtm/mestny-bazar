import type { IBusinessStandards } from "@server/ports/marketplace-standards/business-standards.port";
import type { ICategoryStandards } from "@server/ports/marketplace-standards/category-standards.port";
import type { IContentStandards } from "@server/ports/marketplace-standards/content-standards.port";
import type { IMediaStandards } from "@server/ports/marketplace-standards/media-standards.port";
import type { IPublicationStandards } from "@server/ports/marketplace-standards/publication-standards.port";
import type { IQualityStandards } from "@server/ports/marketplace-standards/quality-standards.port";

/** Unified marketplace standards registry — single source of standard domains. */
export interface IMarketplaceStandards {
  readonly category: ICategoryStandards;
  readonly media: IMediaStandards;
  readonly content: IContentStandards;
  readonly quality: IQualityStandards;
  readonly publication: IPublicationStandards;
  readonly business: IBusinessStandards;
}
