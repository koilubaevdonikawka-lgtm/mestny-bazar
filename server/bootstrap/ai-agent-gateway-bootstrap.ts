import type { IAgentExecutor } from "@server/application/ai-agent-gateway/contracts/agent-executor.contract";
import type { IAgentRepository } from "@server/application/ai-agent-gateway/contracts/agent-repository.contract";
import type { IAgentRequestHistoryRepository } from "@server/application/ai-agent-gateway/contracts/agent-request-history-repository.contract";
import type { IAgentResponseSerializer } from "@server/application/ai-agent-gateway/contracts/agent-response-serializer.contract";
import type { IAgentRouter } from "@server/application/ai-agent-gateway/contracts/agent-router.contract";
import {
  AiAgentGatewayApplicationService,
  AiAgentGatewayService,
  ClearAgentRequestHistoryUseCase,
  ExecuteAgentRequestUseCase,
  GetAgentRequestHistoryUseCase,
  GetAgentUseCase,
  ListAgentsUseCase,
  RegisterAgentRouteUseCase,
  RegisterAgentUseCase,
  RouteAgentRequestUseCase,
} from "@server/application/ai-agent-gateway";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { AgentRepository } from "@server/infrastructure/ai-agent-gateway/agent.repository";
import { AgentRequestHistoryRepository } from "@server/infrastructure/ai-agent-gateway/agent-request-history.repository";
import { DefaultAgentExecutor } from "@server/infrastructure/ai-agent-gateway/default-agent.executor";
import { DefaultAgentRouter } from "@server/infrastructure/ai-agent-gateway/default-agent.router";
import { JsonAgentResponseSerializer } from "@server/infrastructure/ai-agent-gateway/json-agent-response.serializer";

/** Registers AI Agent Gateway services and use cases. */
export function registerAiAgentGatewayApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(InfrastructureTokens.AiAgentGatewayAgentRepository, () =>
    new AgentRepository(),
  );

  registry.registerSingleton(InfrastructureTokens.AiAgentGatewayAgentRouter, () =>
    new DefaultAgentRouter(),
  );

  registry.registerSingleton(InfrastructureTokens.AiAgentGatewayAgentExecutor, () =>
    new DefaultAgentExecutor(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiAgentGatewayAgentRequestHistoryRepository,
    () => new AgentRequestHistoryRepository(),
  );

  registry.registerSingleton(InfrastructureTokens.AiAgentGatewayAgentResponseSerializer, () =>
    new JsonAgentResponseSerializer(),
  );

  registry.registerTransient(InfrastructureTokens.AiAgentGatewayService, (provider) =>
    new AiAgentGatewayService(
      provider.resolve<IAgentRepository>(InfrastructureTokens.AiAgentGatewayAgentRepository),
      provider.resolve<IAgentRouter>(InfrastructureTokens.AiAgentGatewayAgentRouter),
      provider.resolve<IAgentExecutor>(InfrastructureTokens.AiAgentGatewayAgentExecutor),
      provider.resolve<IAgentRequestHistoryRepository>(
        InfrastructureTokens.AiAgentGatewayAgentRequestHistoryRepository,
      ),
      provider.resolve<IAgentResponseSerializer>(
        InfrastructureTokens.AiAgentGatewayAgentResponseSerializer,
      ),
      provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
    ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiAgentGatewayRegisterAgentUseCase,
    (provider) =>
      new RegisterAgentUseCase(
        provider.resolve<AiAgentGatewayService>(InfrastructureTokens.AiAgentGatewayService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAgentGatewayGetAgentUseCase,
    (provider) =>
      new GetAgentUseCase(
        provider.resolve<AiAgentGatewayService>(InfrastructureTokens.AiAgentGatewayService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAgentGatewayListAgentsUseCase,
    (provider) =>
      new ListAgentsUseCase(
        provider.resolve<AiAgentGatewayService>(InfrastructureTokens.AiAgentGatewayService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAgentGatewayRegisterAgentRouteUseCase,
    (provider) =>
      new RegisterAgentRouteUseCase(
        provider.resolve<AiAgentGatewayService>(InfrastructureTokens.AiAgentGatewayService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAgentGatewayRouteAgentRequestUseCase,
    (provider) =>
      new RouteAgentRequestUseCase(
        provider.resolve<AiAgentGatewayService>(InfrastructureTokens.AiAgentGatewayService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAgentGatewayExecuteAgentRequestUseCase,
    (provider) =>
      new ExecuteAgentRequestUseCase(
        provider.resolve<AiAgentGatewayService>(InfrastructureTokens.AiAgentGatewayService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAgentGatewayGetAgentRequestHistoryUseCase,
    (provider) =>
      new GetAgentRequestHistoryUseCase(
        provider.resolve<AiAgentGatewayService>(InfrastructureTokens.AiAgentGatewayService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAgentGatewayClearAgentRequestHistoryUseCase,
    (provider) =>
      new ClearAgentRequestHistoryUseCase(
        provider.resolve<AiAgentGatewayService>(InfrastructureTokens.AiAgentGatewayService),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiAgentGatewayApplicationService,
    (provider) =>
      new AiAgentGatewayApplicationService(
        provider.resolve<RegisterAgentUseCase>(
          InfrastructureTokens.AiAgentGatewayRegisterAgentUseCase,
        ),
        provider.resolve<GetAgentUseCase>(InfrastructureTokens.AiAgentGatewayGetAgentUseCase),
        provider.resolve<ListAgentsUseCase>(InfrastructureTokens.AiAgentGatewayListAgentsUseCase),
        provider.resolve<RegisterAgentRouteUseCase>(
          InfrastructureTokens.AiAgentGatewayRegisterAgentRouteUseCase,
        ),
        provider.resolve<RouteAgentRequestUseCase>(
          InfrastructureTokens.AiAgentGatewayRouteAgentRequestUseCase,
        ),
        provider.resolve<ExecuteAgentRequestUseCase>(
          InfrastructureTokens.AiAgentGatewayExecuteAgentRequestUseCase,
        ),
        provider.resolve<GetAgentRequestHistoryUseCase>(
          InfrastructureTokens.AiAgentGatewayGetAgentRequestHistoryUseCase,
        ),
        provider.resolve<ClearAgentRequestHistoryUseCase>(
          InfrastructureTokens.AiAgentGatewayClearAgentRequestHistoryUseCase,
        ),
      ),
  );
}
