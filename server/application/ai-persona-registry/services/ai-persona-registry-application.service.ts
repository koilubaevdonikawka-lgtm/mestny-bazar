import type {
  RegisterPersonaInput,
  UpdatePersonaInput,
} from "@server/application/ai-persona-registry/models/persona.model";
import {
  DeletePersonaUseCase,
  FindPersonaByNameUseCase,
  GetPersonaRegistryStatisticsUseCase,
  GetPersonaUseCase,
  ListPersonasByTypeUseCase,
  ListPersonasUseCase,
  RegisterPersonaUseCase,
  UpdatePersonaUseCase,
} from "@server/application/ai-persona-registry/use-cases/ai-persona-registry.use-cases";

/** Application facade for AI Persona Registry scenario. */
export class AiPersonaRegistryApplicationService {
  constructor(
    private readonly registerPersonaUseCase: RegisterPersonaUseCase,
    private readonly getPersonaUseCase: GetPersonaUseCase,
    private readonly listPersonasUseCase: ListPersonasUseCase,
    private readonly updatePersonaUseCase: UpdatePersonaUseCase,
    private readonly deletePersonaUseCase: DeletePersonaUseCase,
    private readonly findPersonaByNameUseCase: FindPersonaByNameUseCase,
    private readonly listPersonasByTypeUseCase: ListPersonasByTypeUseCase,
    private readonly getPersonaRegistryStatisticsUseCase: GetPersonaRegistryStatisticsUseCase,
  ) {}

  registerPersona(input: RegisterPersonaInput) {
    return this.registerPersonaUseCase.execute(input);
  }

  getPersona(personaId: string) {
    return this.getPersonaUseCase.execute(personaId);
  }

  listPersonas() {
    return this.listPersonasUseCase.execute();
  }

  updatePersona(input: UpdatePersonaInput) {
    return this.updatePersonaUseCase.execute(input);
  }

  deletePersona(personaId: string) {
    return this.deletePersonaUseCase.execute(personaId);
  }

  findPersonaByName(name: string) {
    return this.findPersonaByNameUseCase.execute(name);
  }

  listPersonasByType(type: string) {
    return this.listPersonasByTypeUseCase.execute(type);
  }

  getPersonaRegistryStatistics() {
    return this.getPersonaRegistryStatisticsUseCase.execute();
  }
}
