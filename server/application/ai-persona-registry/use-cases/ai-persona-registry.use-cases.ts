import type {
  DeletePersonaResult,
  FindPersonaByNameResult,
  ListPersonasByTypeResult,
  ListPersonasResult,
  Persona,
  PersonaRegistryStatistics,
  RegisterPersonaInput,
  UpdatePersonaInput,
} from "@server/application/ai-persona-registry/models/persona.model";
import type { AiPersonaRegistryService } from "@server/application/ai-persona-registry/services/ai-persona-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterPersonaUseCase {
  constructor(private readonly personaRegistry: AiPersonaRegistryService) {}

  execute(input: RegisterPersonaInput): Promise<UseCaseResult<Persona>> {
    return this.personaRegistry.registerPersona(input).then(useCaseResult);
  }
}

export class GetPersonaUseCase {
  constructor(private readonly personaRegistry: AiPersonaRegistryService) {}

  execute(personaId: string): Promise<UseCaseResult<Persona | null>> {
    return this.personaRegistry.getPersona(personaId).then(useCaseResult);
  }
}

export class ListPersonasUseCase {
  constructor(private readonly personaRegistry: AiPersonaRegistryService) {}

  execute(): Promise<UseCaseResult<ListPersonasResult>> {
    return this.personaRegistry.listPersonas().then(useCaseResult);
  }
}

export class UpdatePersonaUseCase {
  constructor(private readonly personaRegistry: AiPersonaRegistryService) {}

  execute(input: UpdatePersonaInput): Promise<UseCaseResult<Persona>> {
    return this.personaRegistry.updatePersona(input).then(useCaseResult);
  }
}

export class DeletePersonaUseCase {
  constructor(private readonly personaRegistry: AiPersonaRegistryService) {}

  execute(personaId: string): Promise<UseCaseResult<DeletePersonaResult>> {
    return this.personaRegistry.deletePersona(personaId).then(useCaseResult);
  }
}

export class FindPersonaByNameUseCase {
  constructor(private readonly personaRegistry: AiPersonaRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindPersonaByNameResult>> {
    return this.personaRegistry.findPersonaByName(name).then(useCaseResult);
  }
}

export class ListPersonasByTypeUseCase {
  constructor(private readonly personaRegistry: AiPersonaRegistryService) {}

  execute(type: string): Promise<UseCaseResult<ListPersonasByTypeResult>> {
    return this.personaRegistry.listPersonasByType(type).then(useCaseResult);
  }
}

export class GetPersonaRegistryStatisticsUseCase {
  constructor(private readonly personaRegistry: AiPersonaRegistryService) {}

  execute(): Promise<UseCaseResult<PersonaRegistryStatistics>> {
    return this.personaRegistry.getPersonaRegistryStatistics().then(useCaseResult);
  }
}
