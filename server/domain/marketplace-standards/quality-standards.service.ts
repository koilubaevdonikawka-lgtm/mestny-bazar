import {
  QUALITY_STANDARDS_DOMAIN,
  type IQualityStandards,
} from "@server/ports/marketplace-standards/quality-standards.port";

/** Quality standards service — infrastructure placeholder. */
export class QualityStandardsService implements IQualityStandards {
  readonly domain = QUALITY_STANDARDS_DOMAIN;
}
