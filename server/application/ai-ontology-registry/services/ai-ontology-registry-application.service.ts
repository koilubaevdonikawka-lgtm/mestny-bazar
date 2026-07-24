import type {
  RegisterOntologyInput,
  UpdateOntologyInput,
} from "@server/application/ai-ontology-registry/models/ontology.model";
import {
  DeleteOntologyUseCase,
  FindOntologyByNameUseCase,
  GetOntologyRegistryStatisticsUseCase,
  GetOntologyUseCase,
  ListOntologiesByCategoryUseCase,
  ListOntologiesUseCase,
  RegisterOntologyUseCase,
  UpdateOntologyUseCase,
} from "@server/application/ai-ontology-registry/use-cases/ai-ontology-registry.use-cases";

/** Application facade for AI Ontology Registry scenario. */
export class AiOntologyRegistryApplicationService {
  constructor(
    private readonly registerOntologyUseCase: RegisterOntologyUseCase,
    private readonly getOntologyUseCase: GetOntologyUseCase,
    private readonly listOntologiesUseCase: ListOntologiesUseCase,
    private readonly updateOntologyUseCase: UpdateOntologyUseCase,
    private readonly deleteOntologyUseCase: DeleteOntologyUseCase,
    private readonly findOntologyByNameUseCase: FindOntologyByNameUseCase,
    private readonly listOntologiesByCategoryUseCase: ListOntologiesByCategoryUseCase,
    private readonly getOntologyRegistryStatisticsUseCase: GetOntologyRegistryStatisticsUseCase,
  ) {}

  registerOntology(input: RegisterOntologyInput) {
    return this.registerOntologyUseCase.execute(input);
  }

  getOntology(ontologyId: string) {
    return this.getOntologyUseCase.execute(ontologyId);
  }

  listOntologies() {
    return this.listOntologiesUseCase.execute();
  }

  updateOntology(input: UpdateOntologyInput) {
    return this.updateOntologyUseCase.execute(input);
  }

  deleteOntology(ontologyId: string) {
    return this.deleteOntologyUseCase.execute(ontologyId);
  }

  findOntologyByName(name: string) {
    return this.findOntologyByNameUseCase.execute(name);
  }

  listOntologiesByCategory(category: string) {
    return this.listOntologiesByCategoryUseCase.execute(category);
  }

  getOntologyRegistryStatistics() {
    return this.getOntologyRegistryStatisticsUseCase.execute();
  }
}
