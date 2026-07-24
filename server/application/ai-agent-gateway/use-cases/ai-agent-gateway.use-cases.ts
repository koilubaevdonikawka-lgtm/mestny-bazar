import type {
  AiAgent,
  AgentRoute,
  ClearAgentRequestHistoryResult,
  ExecuteAgentRequestInput,
  ExecuteAgentRequestResult,
  GetAgentRequestHistoryResult,
  ListAgentsResult,
  RegisterAgentInput,
  RegisterAgentRouteInput,
  RouteAgentRequestInput,
  RouteAgentRequestResult,
} from "@server/application/ai-agent-gateway/models/agent.model";
import type { AiAgentGatewayService } from "@server/application/ai-agent-gateway/services/ai-agent-gateway.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterAgentUseCase {
  constructor(private readonly gateway: AiAgentGatewayService) {}

  execute(input: RegisterAgentInput): Promise<UseCaseResult<AiAgent>> {
    return this.gateway.registerAgent(input).then(useCaseResult);
  }
}

export class GetAgentUseCase {
  constructor(private readonly gateway: AiAgentGatewayService) {}

  execute(agentId: string): Promise<UseCaseResult<AiAgent | null>> {
    return this.gateway.getAgent(agentId).then(useCaseResult);
  }
}

export class ListAgentsUseCase {
  constructor(private readonly gateway: AiAgentGatewayService) {}

  execute(): Promise<UseCaseResult<ListAgentsResult>> {
    return this.gateway.listAgents().then(useCaseResult);
  }
}

export class RegisterAgentRouteUseCase {
  constructor(private readonly gateway: AiAgentGatewayService) {}

  execute(input: RegisterAgentRouteInput): Promise<UseCaseResult<AgentRoute>> {
    return this.gateway.registerAgentRoute(input).then(useCaseResult);
  }
}

export class RouteAgentRequestUseCase {
  constructor(private readonly gateway: AiAgentGatewayService) {}

  execute(input: RouteAgentRequestInput): Promise<UseCaseResult<RouteAgentRequestResult>> {
    return this.gateway.routeAgentRequest(input).then(useCaseResult);
  }
}

export class ExecuteAgentRequestUseCase {
  constructor(private readonly gateway: AiAgentGatewayService) {}

  execute(input: ExecuteAgentRequestInput): Promise<UseCaseResult<ExecuteAgentRequestResult>> {
    return this.gateway.executeAgentRequest(input).then(useCaseResult);
  }
}

export class GetAgentRequestHistoryUseCase {
  constructor(private readonly gateway: AiAgentGatewayService) {}

  execute(): Promise<UseCaseResult<GetAgentRequestHistoryResult>> {
    return this.gateway.getAgentRequestHistory().then(useCaseResult);
  }
}

export class ClearAgentRequestHistoryUseCase {
  constructor(private readonly gateway: AiAgentGatewayService) {}

  execute(): Promise<UseCaseResult<ClearAgentRequestHistoryResult>> {
    return this.gateway.clearAgentRequestHistory().then(useCaseResult);
  }
}
