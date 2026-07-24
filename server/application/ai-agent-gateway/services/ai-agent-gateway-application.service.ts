import type {
  ExecuteAgentRequestInput,
  RegisterAgentInput,
  RegisterAgentRouteInput,
  RouteAgentRequestInput,
} from "@server/application/ai-agent-gateway/models/agent.model";
import {
  ClearAgentRequestHistoryUseCase,
  ExecuteAgentRequestUseCase,
  GetAgentRequestHistoryUseCase,
  GetAgentUseCase,
  ListAgentsUseCase,
  RegisterAgentRouteUseCase,
  RegisterAgentUseCase,
  RouteAgentRequestUseCase,
} from "@server/application/ai-agent-gateway/use-cases/ai-agent-gateway.use-cases";

/** Application facade for AI Agent Gateway scenario. */
export class AiAgentGatewayApplicationService {
  constructor(
    private readonly registerAgentUseCase: RegisterAgentUseCase,
    private readonly getAgentUseCase: GetAgentUseCase,
    private readonly listAgentsUseCase: ListAgentsUseCase,
    private readonly registerAgentRouteUseCase: RegisterAgentRouteUseCase,
    private readonly routeAgentRequestUseCase: RouteAgentRequestUseCase,
    private readonly executeAgentRequestUseCase: ExecuteAgentRequestUseCase,
    private readonly getAgentRequestHistoryUseCase: GetAgentRequestHistoryUseCase,
    private readonly clearAgentRequestHistoryUseCase: ClearAgentRequestHistoryUseCase,
  ) {}

  registerAgent(input: RegisterAgentInput) {
    return this.registerAgentUseCase.execute(input);
  }

  getAgent(agentId: string) {
    return this.getAgentUseCase.execute(agentId);
  }

  listAgents() {
    return this.listAgentsUseCase.execute();
  }

  registerAgentRoute(input: RegisterAgentRouteInput) {
    return this.registerAgentRouteUseCase.execute(input);
  }

  routeAgentRequest(input: RouteAgentRequestInput) {
    return this.routeAgentRequestUseCase.execute(input);
  }

  executeAgentRequest(input: ExecuteAgentRequestInput) {
    return this.executeAgentRequestUseCase.execute(input);
  }

  getAgentRequestHistory() {
    return this.getAgentRequestHistoryUseCase.execute();
  }

  clearAgentRequestHistory() {
    return this.clearAgentRequestHistoryUseCase.execute();
  }
}
