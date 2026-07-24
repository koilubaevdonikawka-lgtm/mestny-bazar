import {
  CATEGORY_STANDARDS_DOMAIN,
  type ICategoryStandards,
} from "@server/ports/marketplace-standards/category-standards.port";

/** Category standards service — infrastructure placeholder. */
export class CategoryStandardsService implements ICategoryStandards {
  readonly domain = CATEGORY_STANDARDS_DOMAIN;
}
