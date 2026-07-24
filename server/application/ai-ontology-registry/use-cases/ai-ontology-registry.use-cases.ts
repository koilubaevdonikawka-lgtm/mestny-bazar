import type {
  DeleteOntologyResult,
  FindOntologyByNameResult,
  ListOntologiesByCategoryResult,
  ListOntologiesResult,
  RegisterOntologyInput,
  Ontology,
  OntologyRegistryStatistics,
  UpdateOntologyInput,
} from "@server/application/ai-ontology-registry/models/ontology.model";
import type { AiOntologyRegistryService } from "@server/application/ai-ontology-registry/services/ai-ontology-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterOntologyUseCase {
  constructor(private readonly ontologyRegistry: AiOntologyRegistryService) {}

  execute(input: RegisterOntologyInput): Promise<UseCaseResult<Ontology>> {
    return this.ontologyRegistry.registerOntology(input).then(useCaseResult);
  }
}

export class GetOntologyUseCase {
  constructor(private readonly ontologyRegistry: AiOntologyRegistryService) {}

  execute(ontologyId: string): Promise<UseCaseResult<Ontology | null>> {
    return this.ontologyRegistry.getOntology(ontologyId).then(useCaseResult);
  }
}

export class ListOntologiesUseCase {
  constructor(private readonly ontologyRegistry: AiOntologyRegistryService) {}

  execute(): Promise<UseCaseResult<ListOntologiesResult>> {
    return this.ontologyRegistry.listOntologies().then(useCaseResult);
  }
}

export class UpdateOntologyUseCase {
  constructor(private readonly ontologyRegistry: AiOntologyRegistryService) {}

  execute(input: UpdateOntologyInput): Promise<UseCaseResult<Ontology>> {
    return this.ontologyRegistry.updateOntology(input).then(useCaseResult);
  }
}

export class DeleteOntologyUseCase {
  constructor(private readonly ontologyRegistry: AiOntologyRegistryService) {}

  execute(ontologyId: string): Promise<UseCaseResult<DeleteOntologyResult>> {
    return this.ontologyRegistry.deleteOntology(ontologyId).then(useCaseResult);
  }
}

export class FindOntologyByNameUseCase {
  constructor(private readonly ontologyRegistry: AiOntologyRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindOntologyByNameResult>> {
    return this.ontologyRegistry.findOntologyByName(name).then(useCaseResult);
  }
}

export class ListOntologiesByCategoryUseCase {
  constructor(private readonly ontologyRegistry: AiOntologyRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListOntologiesByCategoryResult>> {
    return this.ontologyRegistry.listOntologiesByCategory(category).then(useCaseResult);
  }
}

export class GetOntologyRegistryStatisticsUseCase {
  constructor(private readonly ontologyRegistry: AiOntologyRegistryService) {}

  execute(): Promise<UseCaseResult<OntologyRegistryStatistics>> {
    return this.ontologyRegistry.getOntologyRegistryStatistics().then(useCaseResult);
  }
}
