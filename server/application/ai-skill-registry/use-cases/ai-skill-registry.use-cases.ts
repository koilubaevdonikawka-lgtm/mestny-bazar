import type {
  DeleteSkillResult,
  FindSkillByNameResult,
  ListSkillsByCategoryResult,
  ListSkillsResult,
  RegisterSkillInput,
  Skill,
  SkillRegistryStatistics,
  UpdateSkillInput,
} from "@server/application/ai-skill-registry/models/skill.model";
import type { AiSkillRegistryService } from "@server/application/ai-skill-registry/services/ai-skill-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterSkillUseCase {
  constructor(private readonly skillRegistry: AiSkillRegistryService) {}

  execute(input: RegisterSkillInput): Promise<UseCaseResult<Skill>> {
    return this.skillRegistry.registerSkill(input).then(useCaseResult);
  }
}

export class GetSkillUseCase {
  constructor(private readonly skillRegistry: AiSkillRegistryService) {}

  execute(skillId: string): Promise<UseCaseResult<Skill | null>> {
    return this.skillRegistry.getSkill(skillId).then(useCaseResult);
  }
}

export class ListSkillsUseCase {
  constructor(private readonly skillRegistry: AiSkillRegistryService) {}

  execute(): Promise<UseCaseResult<ListSkillsResult>> {
    return this.skillRegistry.listSkills().then(useCaseResult);
  }
}

export class UpdateSkillUseCase {
  constructor(private readonly skillRegistry: AiSkillRegistryService) {}

  execute(input: UpdateSkillInput): Promise<UseCaseResult<Skill>> {
    return this.skillRegistry.updateSkill(input).then(useCaseResult);
  }
}

export class DeleteSkillUseCase {
  constructor(private readonly skillRegistry: AiSkillRegistryService) {}

  execute(skillId: string): Promise<UseCaseResult<DeleteSkillResult>> {
    return this.skillRegistry.deleteSkill(skillId).then(useCaseResult);
  }
}

export class FindSkillByNameUseCase {
  constructor(private readonly skillRegistry: AiSkillRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindSkillByNameResult>> {
    return this.skillRegistry.findSkillByName(name).then(useCaseResult);
  }
}

export class ListSkillsByCategoryUseCase {
  constructor(private readonly skillRegistry: AiSkillRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListSkillsByCategoryResult>> {
    return this.skillRegistry.listSkillsByCategory(category).then(useCaseResult);
  }
}

export class GetSkillRegistryStatisticsUseCase {
  constructor(private readonly skillRegistry: AiSkillRegistryService) {}

  execute(): Promise<UseCaseResult<SkillRegistryStatistics>> {
    return this.skillRegistry.getSkillRegistryStatistics().then(useCaseResult);
  }
}
