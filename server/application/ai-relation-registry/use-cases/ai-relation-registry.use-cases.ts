import type {
  DeleteRelationResult,
  FindRelationByNameResult,
  ListRelationsByCategoryResult,
  ListRelationsResult,
  RegisterRelationInput,
  Relation,
  RelationRegistryStatistics,
  UpdateRelationInput,
} from "@server/application/ai-relation-registry/models/relation.model";
import type { AiRelationRegistryService } from "@server/application/ai-relation-registry/services/ai-relation-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterRelationUseCase {
  constructor(private readonly relationRegistry: AiRelationRegistryService) {}

  execute(input: RegisterRelationInput): Promise<UseCaseResult<Relation>> {
    return this.relationRegistry.registerRelation(input).then(useCaseResult);
  }
}

export class GetRelationUseCase {
  constructor(private readonly relationRegistry: AiRelationRegistryService) {}

  execute(relationId: string): Promise<UseCaseResult<Relation | null>> {
    return this.relationRegistry.getRelation(relationId).then(useCaseResult);
  }
}

export class ListRelationsUseCase {
  constructor(private readonly relationRegistry: AiRelationRegistryService) {}

  execute(): Promise<UseCaseResult<ListRelationsResult>> {
    return this.relationRegistry.listRelations().then(useCaseResult);
  }
}

export class UpdateRelationUseCase {
  constructor(private readonly relationRegistry: AiRelationRegistryService) {}

  execute(input: UpdateRelationInput): Promise<UseCaseResult<Relation>> {
    return this.relationRegistry.updateRelation(input).then(useCaseResult);
  }
}

export class DeleteRelationUseCase {
  constructor(private readonly relationRegistry: AiRelationRegistryService) {}

  execute(relationId: string): Promise<UseCaseResult<DeleteRelationResult>> {
    return this.relationRegistry.deleteRelation(relationId).then(useCaseResult);
  }
}

export class FindRelationByNameUseCase {
  constructor(private readonly relationRegistry: AiRelationRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindRelationByNameResult>> {
    return this.relationRegistry.findRelationByName(name).then(useCaseResult);
  }
}

export class ListRelationsByCategoryUseCase {
  constructor(private readonly relationRegistry: AiRelationRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListRelationsByCategoryResult>> {
    return this.relationRegistry.listRelationsByCategory(category).then(useCaseResult);
  }
}

export class GetRelationRegistryStatisticsUseCase {
  constructor(private readonly relationRegistry: AiRelationRegistryService) {}

  execute(): Promise<UseCaseResult<RelationRegistryStatistics>> {
    return this.relationRegistry.getRelationRegistryStatistics().then(useCaseResult);
  }
}
