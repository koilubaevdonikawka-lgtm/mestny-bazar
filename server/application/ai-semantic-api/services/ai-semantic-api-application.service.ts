import type {
  HandleSemanticRequestInput,
  RegisterSemanticEndpointInput,
  UpdateSemanticEndpointInput,
} from "@server/application/ai-semantic-api/models/semantic-endpoint.model";
import {
  DeleteSemanticEndpointUseCase,
  GetSemanticApiStatisticsUseCase,
  GetSemanticEndpointUseCase,
  GetSemanticRequestHistoryUseCase,
  HandleSemanticRequestUseCase,
  ListSemanticEndpointsUseCase,
  RegisterSemanticEndpointUseCase,
  UpdateSemanticEndpointUseCase,
} from "@server/application/ai-semantic-api/use-cases/ai-semantic-api.use-cases";

/** Application facade for AI Semantic API scenario. */
export class AiSemanticApiApplicationService {
  constructor(
    private readonly registerSemanticEndpointUseCase: RegisterSemanticEndpointUseCase,
    private readonly getSemanticEndpointUseCase: GetSemanticEndpointUseCase,
    private readonly listSemanticEndpointsUseCase: ListSemanticEndpointsUseCase,
    private readonly updateSemanticEndpointUseCase: UpdateSemanticEndpointUseCase,
    private readonly deleteSemanticEndpointUseCase: DeleteSemanticEndpointUseCase,
    private readonly handleSemanticRequestUseCase: HandleSemanticRequestUseCase,
    private readonly getSemanticRequestHistoryUseCase: GetSemanticRequestHistoryUseCase,
    private readonly getSemanticApiStatisticsUseCase: GetSemanticApiStatisticsUseCase,
  ) {}

  registerSemanticEndpoint(input: RegisterSemanticEndpointInput) {
    return this.registerSemanticEndpointUseCase.execute(input);
  }

  getSemanticEndpoint(endpointId: string) {
    return this.getSemanticEndpointUseCase.execute(endpointId);
  }

  listSemanticEndpoints() {
    return this.listSemanticEndpointsUseCase.execute();
  }

  updateSemanticEndpoint(input: UpdateSemanticEndpointInput) {
    return this.updateSemanticEndpointUseCase.execute(input);
  }

  deleteSemanticEndpoint(endpointId: string) {
    return this.deleteSemanticEndpointUseCase.execute(endpointId);
  }

  handleSemanticRequest(input: HandleSemanticRequestInput) {
    return this.handleSemanticRequestUseCase.execute(input);
  }

  getSemanticRequestHistory() {
    return this.getSemanticRequestHistoryUseCase.execute();
  }

  getSemanticApiStatistics() {
    return this.getSemanticApiStatisticsUseCase.execute();
  }
}
