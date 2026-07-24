import {
  BUSINESS_STANDARDS_DOMAIN,
  type IBusinessStandards,
} from "@server/ports/marketplace-standards/business-standards.port";

/** Business standards service — infrastructure placeholder. */
export class BusinessStandardsService implements IBusinessStandards {
  readonly domain = BUSINESS_STANDARDS_DOMAIN;
}
