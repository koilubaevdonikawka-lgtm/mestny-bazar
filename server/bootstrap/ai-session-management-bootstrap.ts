import type { ISessionCatalog } from "@server/application/ai-session-management/contracts/session-catalog.contract";
import type { ISessionRepository } from "@server/application/ai-session-management/contracts/session-repository.contract";
import type { ISessionSerializer } from "@server/application/ai-session-management/contracts/session-serializer.contract";
import type { ISessionStatisticsProvider } from "@server/application/ai-session-management/contracts/session-statistics-provider.contract";
import type { ISessionValidator } from "@server/application/ai-session-management/contracts/session-validator.contract";
import {
  AiSessionManagementApplicationService,
  AiSessionManagementService,
  CloseSessionUseCase,
  CreateSessionUseCase,
  FindSessionByNameUseCase,
  GetSessionStatisticsUseCase,
  GetSessionUseCase,
  ListSessionsByStatusUseCase,
  ListSessionsUseCase,
  UpdateSessionUseCase,
} from "@server/application/ai-session-management";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { DefaultSessionCatalog } from "@server/infrastructure/ai-session-management/default-session.catalog";
import { DefaultSessionStatisticsProvider } from "@server/infrastructure/ai-session-management/default-session-statistics.provider";
import { DefaultSessionValidator } from "@server/infrastructure/ai-session-management/default-session.validator";
import { JsonSessionSerializer } from "@server/infrastructure/ai-session-management/json-session.serializer";
import { SessionRepository } from "@server/infrastructure/ai-session-management/session.repository";

/** Registers AI Session Management services and use cases. */
export function registerAiSessionManagementApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiSessionManagementSessionRepository,
    () => new SessionRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiSessionManagementSessionCatalog,
    () => new DefaultSessionCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiSessionManagementSessionValidator,
    () => new DefaultSessionValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiSessionManagementSessionSerializer,
    () => new JsonSessionSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiSessionManagementSessionStatisticsProvider,
    () => new DefaultSessionStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiSessionManagementService,
    (provider) =>
      new AiSessionManagementService(
        provider.resolve<ISessionRepository>(
          InfrastructureTokens.AiSessionManagementSessionRepository,
        ),
        provider.resolve<ISessionCatalog>(
          InfrastructureTokens.AiSessionManagementSessionCatalog,
        ),
        provider.resolve<ISessionValidator>(
          InfrastructureTokens.AiSessionManagementSessionValidator,
        ),
        provider.resolve<ISessionSerializer>(
          InfrastructureTokens.AiSessionManagementSessionSerializer,
        ),
        provider.resolve<ISessionStatisticsProvider>(
          InfrastructureTokens.AiSessionManagementSessionStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiSessionManagementCreateSessionUseCase,
    (provider) =>
      new CreateSessionUseCase(
        provider.resolve<AiSessionManagementService>(InfrastructureTokens.AiSessionManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSessionManagementGetSessionUseCase,
    (provider) =>
      new GetSessionUseCase(
        provider.resolve<AiSessionManagementService>(InfrastructureTokens.AiSessionManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSessionManagementListSessionsUseCase,
    (provider) =>
      new ListSessionsUseCase(
        provider.resolve<AiSessionManagementService>(InfrastructureTokens.AiSessionManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSessionManagementUpdateSessionUseCase,
    (provider) =>
      new UpdateSessionUseCase(
        provider.resolve<AiSessionManagementService>(InfrastructureTokens.AiSessionManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSessionManagementCloseSessionUseCase,
    (provider) =>
      new CloseSessionUseCase(
        provider.resolve<AiSessionManagementService>(InfrastructureTokens.AiSessionManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSessionManagementFindSessionByNameUseCase,
    (provider) =>
      new FindSessionByNameUseCase(
        provider.resolve<AiSessionManagementService>(InfrastructureTokens.AiSessionManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSessionManagementListSessionsByStatusUseCase,
    (provider) =>
      new ListSessionsByStatusUseCase(
        provider.resolve<AiSessionManagementService>(InfrastructureTokens.AiSessionManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSessionManagementGetSessionStatisticsUseCase,
    (provider) =>
      new GetSessionStatisticsUseCase(
        provider.resolve<AiSessionManagementService>(InfrastructureTokens.AiSessionManagementService),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiSessionManagementApplicationService,
    (provider) =>
      new AiSessionManagementApplicationService(
        provider.resolve<CreateSessionUseCase>(
          InfrastructureTokens.AiSessionManagementCreateSessionUseCase,
        ),
        provider.resolve<GetSessionUseCase>(
          InfrastructureTokens.AiSessionManagementGetSessionUseCase,
        ),
        provider.resolve<ListSessionsUseCase>(
          InfrastructureTokens.AiSessionManagementListSessionsUseCase,
        ),
        provider.resolve<UpdateSessionUseCase>(
          InfrastructureTokens.AiSessionManagementUpdateSessionUseCase,
        ),
        provider.resolve<CloseSessionUseCase>(
          InfrastructureTokens.AiSessionManagementCloseSessionUseCase,
        ),
        provider.resolve<FindSessionByNameUseCase>(
          InfrastructureTokens.AiSessionManagementFindSessionByNameUseCase,
        ),
        provider.resolve<ListSessionsByStatusUseCase>(
          InfrastructureTokens.AiSessionManagementListSessionsByStatusUseCase,
        ),
        provider.resolve<GetSessionStatisticsUseCase>(
          InfrastructureTokens.AiSessionManagementGetSessionStatisticsUseCase,
        ),
      ),
  );
}
