import type { ISandboxEnvironmentFactory } from "@server/application/ai-agent-sandbox/contracts/sandbox-environment-factory.contract";
import type { ISandboxLifecycleManager } from "@server/application/ai-agent-sandbox/contracts/sandbox-lifecycle-manager.contract";
import type { ISandboxRepository } from "@server/application/ai-agent-sandbox/contracts/sandbox-repository.contract";
import type { ISandboxSessionRepository } from "@server/application/ai-agent-sandbox/contracts/sandbox-session-repository.contract";
import type { ISandboxStatisticsProvider } from "@server/application/ai-agent-sandbox/contracts/sandbox-statistics-provider.contract";
import {
  AiAgentSandboxApplicationService,
  AiAgentSandboxService,
  CreateSandboxSessionUseCase,
  DeleteSandboxUseCase,
  GetSandboxStatisticsUseCase,
  GetSandboxUseCase,
  ListSandboxSessionsUseCase,
  ListSandboxesUseCase,
  RegisterSandboxUseCase,
  UpdateSandboxUseCase,
} from "@server/application/ai-agent-sandbox";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { DefaultSandboxEnvironmentFactory } from "@server/infrastructure/ai-agent-sandbox/default-sandbox-environment.factory";
import { DefaultSandboxLifecycleManager } from "@server/infrastructure/ai-agent-sandbox/default-sandbox-lifecycle.manager";
import { DefaultSandboxStatisticsProvider } from "@server/infrastructure/ai-agent-sandbox/default-sandbox-statistics.provider";
import { SandboxSessionRepository } from "@server/infrastructure/ai-agent-sandbox/sandbox-session.repository";
import { SandboxRepository } from "@server/infrastructure/ai-agent-sandbox/sandbox.repository";

/** Registers AI Agent Sandbox services and use cases. */
export function registerAiAgentSandboxApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiAgentSandboxSandboxRepository,
    () => new SandboxRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiAgentSandboxSessionRepository,
    () => new SandboxSessionRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiAgentSandboxEnvironmentFactory,
    () => new DefaultSandboxEnvironmentFactory(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiAgentSandboxLifecycleManager,
    () => new DefaultSandboxLifecycleManager(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiAgentSandboxStatisticsProvider,
    () => new DefaultSandboxStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiAgentSandboxService,
    (provider) =>
      new AiAgentSandboxService(
        provider.resolve<ISandboxRepository>(InfrastructureTokens.AiAgentSandboxSandboxRepository),
        provider.resolve<ISandboxSessionRepository>(
          InfrastructureTokens.AiAgentSandboxSessionRepository,
        ),
        provider.resolve<ISandboxEnvironmentFactory>(
          InfrastructureTokens.AiAgentSandboxEnvironmentFactory,
        ),
        provider.resolve<ISandboxLifecycleManager>(
          InfrastructureTokens.AiAgentSandboxLifecycleManager,
        ),
        provider.resolve<ISandboxStatisticsProvider>(
          InfrastructureTokens.AiAgentSandboxStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiAgentSandboxRegisterSandboxUseCase,
    (provider) =>
      new RegisterSandboxUseCase(
        provider.resolve<AiAgentSandboxService>(InfrastructureTokens.AiAgentSandboxService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAgentSandboxGetSandboxUseCase,
    (provider) =>
      new GetSandboxUseCase(
        provider.resolve<AiAgentSandboxService>(InfrastructureTokens.AiAgentSandboxService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAgentSandboxListSandboxesUseCase,
    (provider) =>
      new ListSandboxesUseCase(
        provider.resolve<AiAgentSandboxService>(InfrastructureTokens.AiAgentSandboxService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAgentSandboxUpdateSandboxUseCase,
    (provider) =>
      new UpdateSandboxUseCase(
        provider.resolve<AiAgentSandboxService>(InfrastructureTokens.AiAgentSandboxService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAgentSandboxDeleteSandboxUseCase,
    (provider) =>
      new DeleteSandboxUseCase(
        provider.resolve<AiAgentSandboxService>(InfrastructureTokens.AiAgentSandboxService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAgentSandboxCreateSandboxSessionUseCase,
    (provider) =>
      new CreateSandboxSessionUseCase(
        provider.resolve<AiAgentSandboxService>(InfrastructureTokens.AiAgentSandboxService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAgentSandboxListSandboxSessionsUseCase,
    (provider) =>
      new ListSandboxSessionsUseCase(
        provider.resolve<AiAgentSandboxService>(InfrastructureTokens.AiAgentSandboxService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAgentSandboxGetSandboxStatisticsUseCase,
    (provider) =>
      new GetSandboxStatisticsUseCase(
        provider.resolve<AiAgentSandboxService>(InfrastructureTokens.AiAgentSandboxService),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiAgentSandboxApplicationService,
    (provider) =>
      new AiAgentSandboxApplicationService(
        provider.resolve<RegisterSandboxUseCase>(
          InfrastructureTokens.AiAgentSandboxRegisterSandboxUseCase,
        ),
        provider.resolve<GetSandboxUseCase>(InfrastructureTokens.AiAgentSandboxGetSandboxUseCase),
        provider.resolve<ListSandboxesUseCase>(
          InfrastructureTokens.AiAgentSandboxListSandboxesUseCase,
        ),
        provider.resolve<UpdateSandboxUseCase>(
          InfrastructureTokens.AiAgentSandboxUpdateSandboxUseCase,
        ),
        provider.resolve<DeleteSandboxUseCase>(
          InfrastructureTokens.AiAgentSandboxDeleteSandboxUseCase,
        ),
        provider.resolve<CreateSandboxSessionUseCase>(
          InfrastructureTokens.AiAgentSandboxCreateSandboxSessionUseCase,
        ),
        provider.resolve<ListSandboxSessionsUseCase>(
          InfrastructureTokens.AiAgentSandboxListSandboxSessionsUseCase,
        ),
        provider.resolve<GetSandboxStatisticsUseCase>(
          InfrastructureTokens.AiAgentSandboxGetSandboxStatisticsUseCase,
        ),
      ),
  );
}
