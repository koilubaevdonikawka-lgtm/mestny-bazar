import type { ISkillStatisticsProvider } from "@server/application/ai-skill-registry/contracts/skill-statistics-provider.contract";
import type { SkillRegistryStatistics } from "@server/application/ai-skill-registry/models/skill.model";

/** Default in-memory skill statistics provider. */
export class DefaultSkillStatisticsProvider implements ISkillStatisticsProvider {
  async getStatistics(input: {
    totalSkills: number;
    activeSkills: number;
    categories: readonly string[];
  }): Promise<SkillRegistryStatistics> {
    return Object.freeze({
      totalSkills: input.totalSkills,
      activeSkills: input.activeSkills,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}
