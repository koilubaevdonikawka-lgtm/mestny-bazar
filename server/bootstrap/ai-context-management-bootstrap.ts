import type { IContextCatalog } from "@server/application/ai-context-management/contracts/context-catalog.contract";
import type { IContextRepository } from "@server/application/ai-context-management/contracts/context-repository.contract";
import type { IContextSerializer } from "@server/application/ai-context-management/contracts/context-serializer.contract";
import type { IContextStatisticsProvider } from "@server/application/ai-context-management/contracts/context-statistics-provider.contract";
import type { IContextValidator } from "@server/application/ai-context-management/contracts/context-validator.contract";
import {
  AiContextManagementApplicationService,
  AiContextManagementService,
  CreateContextUseCase,
  DeleteContextUseCase,
  FindContextByNameUseCase,
  GetContextStatisticsUseCase,
  GetContextUseCase,
  ListContextsByCategoryUseCase,
  ListContextsUseCase,
  UpdateContextUseCase,
} from "@server/application/ai-context-management";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { ContextRepository } from "@server/infrastructure/ai-context-management/context.repository";
import { DefaultContextCatalog } from "@server/infrastructure/ai-context-management/default-context.catalog";
import { DefaultContextStatisticsProvider } from "@server/infrastructure/ai-context-management/default-context-statistics.provider";
import { DefaultContextValidator } from "@server/infrastructure/ai-context-management/default-context.validator";
import { JsonContextSerializer } from "@server/infrastructure/ai-context-management/json-context.serializer";

/** Registers AI Context Management services and use cases. */
export function registerAiContextManagementApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiContextManagementContextRepository,
    () => new ContextRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiContextManagementContextCatalog,
    () => new DefaultContextCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiContextManagementContextValidator,
    () => new DefaultContextValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiContextManagementContextSerializer,
    () => new JsonContextSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiContextManagementContextStatisticsProvider,
    () => new DefaultContextStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiContextManagementService,
    (provider) =>
      new AiContextManagementService(
        provider.resolve<IContextRepository>(
          InfrastructureTokens.AiContextManagementContextRepository,
        ),
        provider.resolve<IContextCatalog>(
          InfrastructureTokens.AiContextManagementContextCatalog,
        ),
        provider.resolve<IContextValidator>(
          InfrastructureTokens.AiContextManagementContextValidator,
        ),
        provider.resolve<IContextSerializer>(
          InfrastructureTokens.AiContextManagementContextSerializer,
        ),
        provider.resolve<IContextStatisticsProvider>(
          InfrastructureTokens.AiContextManagementContextStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiContextManagementCreateContextUseCase,
    (provider) =>
      new CreateContextUseCase(
        provider.resolve<AiContextManagementService>(InfrastructureTokens.AiContextManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiContextManagementGetContextUseCase,
    (provider) =>
      new GetContextUseCase(
        provider.resolve<AiContextManagementService>(InfrastructureTokens.AiContextManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiContextManagementListContextsUseCase,
    (provider) =>
      new ListContextsUseCase(
        provider.resolve<AiContextManagementService>(InfrastructureTokens.AiContextManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiContextManagementUpdateContextUseCase,
    (provider) =>
      new UpdateContextUseCase(
        provider.resolve<AiContextManagementService>(InfrastructureTokens.AiContextManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiContextManagementDeleteContextUseCase,
    (provider) =>
      new DeleteContextUseCase(
        provider.resolve<AiContextManagementService>(InfrastructureTokens.AiContextManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiContextManagementFindContextByNameUseCase,
    (provider) =>
      new FindContextByNameUseCase(
        provider.resolve<AiContextManagementService>(InfrastructureTokens.AiContextManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiContextManagementListContextsByCategoryUseCase,
    (provider) =>
      new ListContextsByCategoryUseCase(
        provider.resolve<AiContextManagementService>(InfrastructureTokens.AiContextManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiContextManagementGetContextStatisticsUseCase,
    (provider) =>
      new GetContextStatisticsUseCase(
        provider.resolve<AiContextManagementService>(InfrastructureTokens.AiContextManagementService),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiContextManagementApplicationService,
    (provider) =>
      new AiContextManagementApplicationService(
        provider.resolve<CreateContextUseCase>(
          InfrastructureTokens.AiContextManagementCreateContextUseCase,
        ),
        provider.resolve<GetContextUseCase>(
          InfrastructureTokens.AiContextManagementGetContextUseCase,
        ),
        provider.resolve<ListContextsUseCase>(
          InfrastructureTokens.AiContextManagementListContextsUseCase,
        ),
        provider.resolve<UpdateContextUseCase>(
          InfrastructureTokens.AiContextManagementUpdateContextUseCase,
        ),
        provider.resolve<DeleteContextUseCase>(
          InfrastructureTokens.AiContextManagementDeleteContextUseCase,
        ),
        provider.resolve<FindContextByNameUseCase>(
          InfrastructureTokens.AiContextManagementFindContextByNameUseCase,
        ),
        provider.resolve<ListContextsByCategoryUseCase>(
          InfrastructureTokens.AiContextManagementListContextsByCategoryUseCase,
        ),
        provider.resolve<GetContextStatisticsUseCase>(
          InfrastructureTokens.AiContextManagementGetContextStatisticsUseCase,
        ),
      ),
  );
}
