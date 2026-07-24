import type { TemplateRegistryStatistics } from "@server/application/ai-template-registry/models/template.model";

export interface ITemplateStatisticsProvider {
  getStatistics(input: {
    totalTemplates: number;
    activeTemplates: number;
    categories: readonly string[];
  }): Promise<TemplateRegistryStatistics>;
}
