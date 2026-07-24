import type { SkillRegistryStatistics } from "@server/application/ai-skill-registry/models/skill.model";

export interface ISkillStatisticsProvider {
  getStatistics(input: {
    totalSkills: number;
    activeSkills: number;
    categories: readonly string[];
  }): Promise<SkillRegistryStatistics>;
}
