import type { IAgentFactory } from "@server/application/ai-agent-sdk/contracts/agent-factory.contract";
import type { IAgentInstanceRepository } from "@server/application/ai-agent-sdk/contracts/agent-instance-repository.contract";
import type { IAgentLifecycleManager } from "@server/application/ai-agent-sdk/contracts/agent-lifecycle-manager.contract";
import type { IAgentSdkRepository } from "@server/application/ai-agent-sdk/contracts/agent-sdk-repository.contract";
import type { IAgentSdkStatisticsProvider } from "@server/application/ai-agent-sdk/contracts/agent-sdk-statistics-provider.contract";
import {
  AiAgentSdkApplicationService,
  AiAgentSdkService,
  CreateAgentInstanceUseCase,
  DeleteAgentSdkUseCase,
  GetAgentSdkStatisticsUseCase,
  GetAgentSdkUseCase,
  ListAgentInstancesUseCase,
  ListAgentSdksUseCase,
  RegisterAgentSdkUseCase,
  UpdateAgentSdkUseCase,
} from "@server/application/ai-agent-sdk";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { AgentInstanceRepository } from "@server/infrastructure/ai-agent-sdk/agent-instance.repository";
import { AgentSdkRepository } from "@server/infrastructure/ai-agent-sdk/agent-sdk.repository";
import { DefaultAgentFactory } from "@server/infrastructure/ai-agent-sdk/default-agent.factory";
import { DefaultAgentLifecycleManager } from "@server/infrastructure/ai-agent-sdk/default-agent-lifecycle.manager";
import { DefaultAgentSdkStatisticsProvider } from "@server/infrastructure/ai-agent-sdk/default-agent-sdk-statistics.provider";

/** Registers AI Agent SDK services and use cases. */
export function registerAiAgentSdkApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiAgentSdkSdkRepository,
    () => new AgentSdkRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiAgentSdkInstanceRepository,
    () => new AgentInstanceRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiAgentSdkAgentFactory,
    () => new DefaultAgentFactory(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiAgentSdkAgentLifecycleManager,
    () => new DefaultAgentLifecycleManager(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiAgentSdkSdkStatisticsProvider,
    () => new DefaultAgentSdkStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiAgentSdkService,
    (provider) =>
      new AiAgentSdkService(
        provider.resolve<IAgentSdkRepository>(InfrastructureTokens.AiAgentSdkSdkRepository),
        provider.resolve<IAgentInstanceRepository>(InfrastructureTokens.AiAgentSdkInstanceRepository),
        provider.resolve<IAgentFactory>(InfrastructureTokens.AiAgentSdkAgentFactory),
        provider.resolve<IAgentLifecycleManager>(InfrastructureTokens.AiAgentSdkAgentLifecycleManager),
        provider.resolve<IAgentSdkStatisticsProvider>(
          InfrastructureTokens.AiAgentSdkSdkStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiAgentSdkRegisterAgentSdkUseCase,
    (provider) =>
      new RegisterAgentSdkUseCase(
        provider.resolve<AiAgentSdkService>(InfrastructureTokens.AiAgentSdkService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAgentSdkGetAgentSdkUseCase,
    (provider) =>
      new GetAgentSdkUseCase(
        provider.resolve<AiAgentSdkService>(InfrastructureTokens.AiAgentSdkService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAgentSdkListAgentSdksUseCase,
    (provider) =>
      new ListAgentSdksUseCase(
        provider.resolve<AiAgentSdkService>(InfrastructureTokens.AiAgentSdkService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAgentSdkUpdateAgentSdkUseCase,
    (provider) =>
      new UpdateAgentSdkUseCase(
        provider.resolve<AiAgentSdkService>(InfrastructureTokens.AiAgentSdkService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAgentSdkDeleteAgentSdkUseCase,
    (provider) =>
      new DeleteAgentSdkUseCase(
        provider.resolve<AiAgentSdkService>(InfrastructureTokens.AiAgentSdkService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAgentSdkCreateAgentInstanceUseCase,
    (provider) =>
      new CreateAgentInstanceUseCase(
        provider.resolve<AiAgentSdkService>(InfrastructureTokens.AiAgentSdkService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAgentSdkListAgentInstancesUseCase,
    (provider) =>
      new ListAgentInstancesUseCase(
        provider.resolve<AiAgentSdkService>(InfrastructureTokens.AiAgentSdkService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAgentSdkGetAgentSdkStatisticsUseCase,
    (provider) =>
      new GetAgentSdkStatisticsUseCase(
        provider.resolve<AiAgentSdkService>(InfrastructureTokens.AiAgentSdkService),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiAgentSdkApplicationService,
    (provider) =>
      new AiAgentSdkApplicationService(
        provider.resolve<RegisterAgentSdkUseCase>(
          InfrastructureTokens.AiAgentSdkRegisterAgentSdkUseCase,
        ),
        provider.resolve<GetAgentSdkUseCase>(InfrastructureTokens.AiAgentSdkGetAgentSdkUseCase),
        provider.resolve<ListAgentSdksUseCase>(InfrastructureTokens.AiAgentSdkListAgentSdksUseCase),
        provider.resolve<UpdateAgentSdkUseCase>(
          InfrastructureTokens.AiAgentSdkUpdateAgentSdkUseCase,
        ),
        provider.resolve<DeleteAgentSdkUseCase>(
          InfrastructureTokens.AiAgentSdkDeleteAgentSdkUseCase,
        ),
        provider.resolve<CreateAgentInstanceUseCase>(
          InfrastructureTokens.AiAgentSdkCreateAgentInstanceUseCase,
        ),
        provider.resolve<ListAgentInstancesUseCase>(
          InfrastructureTokens.AiAgentSdkListAgentInstancesUseCase,
        ),
        provider.resolve<GetAgentSdkStatisticsUseCase>(
          InfrastructureTokens.AiAgentSdkGetAgentSdkStatisticsUseCase,
        ),
      ),
  );
}
