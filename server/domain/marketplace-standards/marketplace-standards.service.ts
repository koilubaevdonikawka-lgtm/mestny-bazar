import type { IMarketplaceStandards } from "@server/ports/marketplace-standards/marketplace-standards.port";
import type { IBusinessStandards } from "@server/ports/marketplace-standards/business-standards.port";
import type { ICategoryStandards } from "@server/ports/marketplace-standards/category-standards.port";
import type { IContentStandards } from "@server/ports/marketplace-standards/content-standards.port";
import type { IMediaStandards } from "@server/ports/marketplace-standards/media-standards.port";
import type { IPublicationStandards } from "@server/ports/marketplace-standards/publication-standards.port";
import type { IQualityStandards } from "@server/ports/marketplace-standards/quality-standards.port";

export interface MarketplaceStandardsDeps {
  category: ICategoryStandards;
  media: IMediaStandards;
  content: IContentStandards;
  quality: IQualityStandards;
  publication: IPublicationStandards;
  business: IBusinessStandards;
}

/** Composition root facade for all marketplace standard domains. */
export class MarketplaceStandardsService implements IMarketplaceStandards {
  readonly category: ICategoryStandards;
  readonly media: IMediaStandards;
  readonly content: IContentStandards;
  readonly quality: IQualityStandards;
  readonly publication: IPublicationStandards;
  readonly business: IBusinessStandards;

  constructor(deps: MarketplaceStandardsDeps) {
    this.category = deps.category;
    this.media = deps.media;
    this.content = deps.content;
    this.quality = deps.quality;
    this.publication = deps.publication;
    this.business = deps.business;
  }
}
