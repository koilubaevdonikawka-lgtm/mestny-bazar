import type {
  RegisterRelationInput,
  UpdateRelationInput,
} from "@server/application/ai-relation-registry/models/relation.model";
import {
  DeleteRelationUseCase,
  FindRelationByNameUseCase,
  GetRelationRegistryStatisticsUseCase,
  GetRelationUseCase,
  ListRelationsByCategoryUseCase,
  ListRelationsUseCase,
  RegisterRelationUseCase,
  UpdateRelationUseCase,
} from "@server/application/ai-relation-registry/use-cases/ai-relation-registry.use-cases";

/** Application facade for AI Relation Registry scenario. */
export class AiRelationRegistryApplicationService {
  constructor(
    private readonly registerRelationUseCase: RegisterRelationUseCase,
    private readonly getRelationUseCase: GetRelationUseCase,
    private readonly listRelationsUseCase: ListRelationsUseCase,
    private readonly updateRelationUseCase: UpdateRelationUseCase,
    private readonly deleteRelationUseCase: DeleteRelationUseCase,
    private readonly findRelationByNameUseCase: FindRelationByNameUseCase,
    private readonly listRelationsByCategoryUseCase: ListRelationsByCategoryUseCase,
    private readonly getRelationRegistryStatisticsUseCase: GetRelationRegistryStatisticsUseCase,
  ) {}

  registerRelation(input: RegisterRelationInput) {
    return this.registerRelationUseCase.execute(input);
  }

  getRelation(relationId: string) {
    return this.getRelationUseCase.execute(relationId);
  }

  listRelations() {
    return this.listRelationsUseCase.execute();
  }

  updateRelation(input: UpdateRelationInput) {
    return this.updateRelationUseCase.execute(input);
  }

  deleteRelation(relationId: string) {
    return this.deleteRelationUseCase.execute(relationId);
  }

  findRelationByName(name: string) {
    return this.findRelationByNameUseCase.execute(name);
  }

  listRelationsByCategory(category: string) {
    return this.listRelationsByCategoryUseCase.execute(category);
  }

  getRelationRegistryStatistics() {
    return this.getRelationRegistryStatisticsUseCase.execute();
  }
}
