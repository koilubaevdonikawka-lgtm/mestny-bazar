import type {
  DeleteConceptResult,
  FindConceptByNameResult,
  ListConceptsByCategoryResult,
  ListConceptsResult,
  RegisterConceptInput,
  Concept,
  ConceptRegistryStatistics,
  UpdateConceptInput,
} from "@server/application/ai-concept-registry/models/concept.model";
import type { AiConceptRegistryService } from "@server/application/ai-concept-registry/services/ai-concept-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterConceptUseCase {
  constructor(private readonly conceptRegistry: AiConceptRegistryService) {}

  execute(input: RegisterConceptInput): Promise<UseCaseResult<Concept>> {
    return this.conceptRegistry.registerConcept(input).then(useCaseResult);
  }
}

export class GetConceptUseCase {
  constructor(private readonly conceptRegistry: AiConceptRegistryService) {}

  execute(conceptId: string): Promise<UseCaseResult<Concept | null>> {
    return this.conceptRegistry.getConcept(conceptId).then(useCaseResult);
  }
}

export class ListConceptsUseCase {
  constructor(private readonly conceptRegistry: AiConceptRegistryService) {}

  execute(): Promise<UseCaseResult<ListConceptsResult>> {
    return this.conceptRegistry.listConcepts().then(useCaseResult);
  }
}

export class UpdateConceptUseCase {
  constructor(private readonly conceptRegistry: AiConceptRegistryService) {}

  execute(input: UpdateConceptInput): Promise<UseCaseResult<Concept>> {
    return this.conceptRegistry.updateConcept(input).then(useCaseResult);
  }
}

export class DeleteConceptUseCase {
  constructor(private readonly conceptRegistry: AiConceptRegistryService) {}

  execute(conceptId: string): Promise<UseCaseResult<DeleteConceptResult>> {
    return this.conceptRegistry.deleteConcept(conceptId).then(useCaseResult);
  }
}

export class FindConceptByNameUseCase {
  constructor(private readonly conceptRegistry: AiConceptRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindConceptByNameResult>> {
    return this.conceptRegistry.findConceptByName(name).then(useCaseResult);
  }
}

export class ListConceptsByCategoryUseCase {
  constructor(private readonly conceptRegistry: AiConceptRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListConceptsByCategoryResult>> {
    return this.conceptRegistry.listConceptsByCategory(category).then(useCaseResult);
  }
}

export class GetConceptRegistryStatisticsUseCase {
  constructor(private readonly conceptRegistry: AiConceptRegistryService) {}

  execute(): Promise<UseCaseResult<ConceptRegistryStatistics>> {
    return this.conceptRegistry.getConceptRegistryStatistics().then(useCaseResult);
  }
}
