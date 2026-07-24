import type {
  DeleteSemanticEndpointResult,
  GetSemanticRequestHistoryResult,
  HandleSemanticRequestInput,
  HandleSemanticRequestResult,
  ListSemanticEndpointsResult,
  RegisterSemanticEndpointInput,
  SemanticApiStatistics,
  SemanticEndpoint,
  UpdateSemanticEndpointInput,
} from "@server/application/ai-semantic-api/models/semantic-endpoint.model";
import type { AiSemanticApiService } from "@server/application/ai-semantic-api/services/ai-semantic-api.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterSemanticEndpointUseCase {
  constructor(private readonly semanticApi: AiSemanticApiService) {}

  execute(input: RegisterSemanticEndpointInput): Promise<UseCaseResult<SemanticEndpoint>> {
    return this.semanticApi.registerSemanticEndpoint(input).then(useCaseResult);
  }
}

export class GetSemanticEndpointUseCase {
  constructor(private readonly semanticApi: AiSemanticApiService) {}

  execute(endpointId: string): Promise<UseCaseResult<SemanticEndpoint | null>> {
    return this.semanticApi.getSemanticEndpoint(endpointId).then(useCaseResult);
  }
}

export class ListSemanticEndpointsUseCase {
  constructor(private readonly semanticApi: AiSemanticApiService) {}

  execute(): Promise<UseCaseResult<ListSemanticEndpointsResult>> {
    return this.semanticApi.listSemanticEndpoints().then(useCaseResult);
  }
}

export class UpdateSemanticEndpointUseCase {
  constructor(private readonly semanticApi: AiSemanticApiService) {}

  execute(input: UpdateSemanticEndpointInput): Promise<UseCaseResult<SemanticEndpoint>> {
    return this.semanticApi.updateSemanticEndpoint(input).then(useCaseResult);
  }
}

export class DeleteSemanticEndpointUseCase {
  constructor(private readonly semanticApi: AiSemanticApiService) {}

  execute(endpointId: string): Promise<UseCaseResult<DeleteSemanticEndpointResult>> {
    return this.semanticApi.deleteSemanticEndpoint(endpointId).then(useCaseResult);
  }
}

export class HandleSemanticRequestUseCase {
  constructor(private readonly semanticApi: AiSemanticApiService) {}

  execute(input: HandleSemanticRequestInput): Promise<UseCaseResult<HandleSemanticRequestResult>> {
    return this.semanticApi.handleSemanticRequest(input).then(useCaseResult);
  }
}

export class GetSemanticRequestHistoryUseCase {
  constructor(private readonly semanticApi: AiSemanticApiService) {}

  execute(): Promise<UseCaseResult<GetSemanticRequestHistoryResult>> {
    return this.semanticApi.getSemanticRequestHistory().then(useCaseResult);
  }
}

export class GetSemanticApiStatisticsUseCase {
  constructor(private readonly semanticApi: AiSemanticApiService) {}

  execute(): Promise<UseCaseResult<SemanticApiStatistics>> {
    return this.semanticApi.getSemanticApiStatistics().then(useCaseResult);
  }
}
