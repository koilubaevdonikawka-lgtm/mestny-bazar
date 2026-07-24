import type { ITemplateStatisticsProvider } from "@server/application/ai-template-registry/contracts/template-statistics-provider.contract";
import type { TemplateRegistryStatistics } from "@server/application/ai-template-registry/models/template.model";

/** Default in-memory template statistics provider. */
export class DefaultTemplateStatisticsProvider implements ITemplateStatisticsProvider {
  async getStatistics(input: {
    totalTemplates: number;
    activeTemplates: number;
    categories: readonly string[];
  }): Promise<TemplateRegistryStatistics> {
    return Object.freeze({
      totalTemplates: input.totalTemplates,
      activeTemplates: input.activeTemplates,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}
