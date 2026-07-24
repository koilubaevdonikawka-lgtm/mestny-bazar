import type {
  RegisterConceptInput,
  UpdateConceptInput,
} from "@server/application/ai-concept-registry/models/concept.model";
import {
  DeleteConceptUseCase,
  FindConceptByNameUseCase,
  GetConceptRegistryStatisticsUseCase,
  GetConceptUseCase,
  ListConceptsByCategoryUseCase,
  ListConceptsUseCase,
  RegisterConceptUseCase,
  UpdateConceptUseCase,
} from "@server/application/ai-concept-registry/use-cases/ai-concept-registry.use-cases";

/** Application facade for AI Concept Registry scenario. */
export class AiConceptRegistryApplicationService {
  constructor(
    private readonly registerConceptUseCase: RegisterConceptUseCase,
    private readonly getConceptUseCase: GetConceptUseCase,
    private readonly listConceptsUseCase: ListConceptsUseCase,
    private readonly updateConceptUseCase: UpdateConceptUseCase,
    private readonly deleteConceptUseCase: DeleteConceptUseCase,
    private readonly findConceptByNameUseCase: FindConceptByNameUseCase,
    private readonly listConceptsByCategoryUseCase: ListConceptsByCategoryUseCase,
    private readonly getConceptRegistryStatisticsUseCase: GetConceptRegistryStatisticsUseCase,
  ) {}

  registerConcept(input: RegisterConceptInput) {
    return this.registerConceptUseCase.execute(input);
  }

  getConcept(conceptId: string) {
    return this.getConceptUseCase.execute(conceptId);
  }

  listConcepts() {
    return this.listConceptsUseCase.execute();
  }

  updateConcept(input: UpdateConceptInput) {
    return this.updateConceptUseCase.execute(input);
  }

  deleteConcept(conceptId: string) {
    return this.deleteConceptUseCase.execute(conceptId);
  }

  findConceptByName(name: string) {
    return this.findConceptByNameUseCase.execute(name);
  }

  listConceptsByCategory(category: string) {
    return this.listConceptsByCategoryUseCase.execute(category);
  }

  getConceptRegistryStatistics() {
    return this.getConceptRegistryStatisticsUseCase.execute();
  }
}
