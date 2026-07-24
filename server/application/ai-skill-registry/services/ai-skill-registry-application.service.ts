import type {
  RegisterSkillInput,
  UpdateSkillInput,
} from "@server/application/ai-skill-registry/models/skill.model";
import {
  DeleteSkillUseCase,
  FindSkillByNameUseCase,
  GetSkillRegistryStatisticsUseCase,
  GetSkillUseCase,
  ListSkillsByCategoryUseCase,
  ListSkillsUseCase,
  RegisterSkillUseCase,
  UpdateSkillUseCase,
} from "@server/application/ai-skill-registry/use-cases/ai-skill-registry.use-cases";

/** Application facade for AI Skill Registry scenario. */
export class AiSkillRegistryApplicationService {
  constructor(
    private readonly registerSkillUseCase: RegisterSkillUseCase,
    private readonly getSkillUseCase: GetSkillUseCase,
    private readonly listSkillsUseCase: ListSkillsUseCase,
    private readonly updateSkillUseCase: UpdateSkillUseCase,
    private readonly deleteSkillUseCase: DeleteSkillUseCase,
    private readonly findSkillByNameUseCase: FindSkillByNameUseCase,
    private readonly listSkillsByCategoryUseCase: ListSkillsByCategoryUseCase,
    private readonly getSkillRegistryStatisticsUseCase: GetSkillRegistryStatisticsUseCase,
  ) {}

  registerSkill(input: RegisterSkillInput) {
    return this.registerSkillUseCase.execute(input);
  }

  getSkill(skillId: string) {
    return this.getSkillUseCase.execute(skillId);
  }

  listSkills() {
    return this.listSkillsUseCase.execute();
  }

  updateSkill(input: UpdateSkillInput) {
    return this.updateSkillUseCase.execute(input);
  }

  deleteSkill(skillId: string) {
    return this.deleteSkillUseCase.execute(skillId);
  }

  findSkillByName(name: string) {
    return this.findSkillByNameUseCase.execute(name);
  }

  listSkillsByCategory(category: string) {
    return this.listSkillsByCategoryUseCase.execute(category);
  }

  getSkillRegistryStatistics() {
    return this.getSkillRegistryStatisticsUseCase.execute();
  }
}
