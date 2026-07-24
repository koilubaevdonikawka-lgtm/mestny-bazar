import type { IToolCatalog } from "@server/application/ai-tool-registry/contracts/tool-catalog.contract";
import type { IToolRepository } from "@server/application/ai-tool-registry/contracts/tool-repository.contract";
import type { IToolSerializer } from "@server/application/ai-tool-registry/contracts/tool-serializer.contract";
import type { IToolStatisticsProvider } from "@server/application/ai-tool-registry/contracts/tool-statistics-provider.contract";
import type { IToolValidator } from "@server/application/ai-tool-registry/contracts/tool-validator.contract";
import {
  AiToolRegistryApplicationService,
  AiToolRegistryService,
  DeleteToolUseCase,
  FindToolByNameUseCase,
  GetToolRegistryStatisticsUseCase,
  GetToolUseCase,
  ListToolsByCategoryUseCase,
  ListToolsUseCase,
  RegisterToolUseCase,
  UpdateToolUseCase,
} from "@server/application/ai-tool-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { DefaultToolCatalog } from "@server/infrastructure/ai-tool-registry/default-tool.catalog";
import { DefaultToolStatisticsProvider } from "@server/infrastructure/ai-tool-registry/default-tool-statistics.provider";
import { DefaultToolValidator } from "@server/infrastructure/ai-tool-registry/default-tool.validator";
import { JsonToolSerializer } from "@server/infrastructure/ai-tool-registry/json-tool.serializer";
import { ToolRepository } from "@server/infrastructure/ai-tool-registry/tool.repository";

/** Registers AI Tool Registry services and use cases. */
export function registerAiToolRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(InfrastructureTokens.AiToolRegistryToolRepository, () =>
    new ToolRepository(),
  );

  registry.registerSingleton(InfrastructureTokens.AiToolRegistryToolCatalog, (provider) =>
    new DefaultToolCatalog(
      provider.resolve<IToolRepository>(InfrastructureTokens.AiToolRegistryToolRepository),
    ),
  );

  registry.registerSingleton(InfrastructureTokens.AiToolRegistryToolValidator, () =>
    new DefaultToolValidator(),
  );

  registry.registerSingleton(InfrastructureTokens.AiToolRegistryToolSerializer, () =>
    new JsonToolSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiToolRegistryToolStatisticsProvider,
    () => new DefaultToolStatisticsProvider(),
  );

  registry.registerTransient(InfrastructureTokens.AiToolRegistryService, (provider) =>
    new AiToolRegistryService(
      provider.resolve<IToolRepository>(InfrastructureTokens.AiToolRegistryToolRepository),
      provider.resolve<IToolCatalog>(InfrastructureTokens.AiToolRegistryToolCatalog),
      provider.resolve<IToolValidator>(InfrastructureTokens.AiToolRegistryToolValidator),
      provider.resolve<IToolSerializer>(InfrastructureTokens.AiToolRegistryToolSerializer),
      provider.resolve<IToolStatisticsProvider>(
        InfrastructureTokens.AiToolRegistryToolStatisticsProvider,
      ),
      provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
    ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiToolRegistryRegisterToolUseCase,
    (provider) =>
      new RegisterToolUseCase(
        provider.resolve<AiToolRegistryService>(InfrastructureTokens.AiToolRegistryService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiToolRegistryGetToolUseCase,
    (provider) =>
      new GetToolUseCase(
        provider.resolve<AiToolRegistryService>(InfrastructureTokens.AiToolRegistryService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiToolRegistryListToolsUseCase,
    (provider) =>
      new ListToolsUseCase(
        provider.resolve<AiToolRegistryService>(InfrastructureTokens.AiToolRegistryService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiToolRegistryUpdateToolUseCase,
    (provider) =>
      new UpdateToolUseCase(
        provider.resolve<AiToolRegistryService>(InfrastructureTokens.AiToolRegistryService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiToolRegistryDeleteToolUseCase,
    (provider) =>
      new DeleteToolUseCase(
        provider.resolve<AiToolRegistryService>(InfrastructureTokens.AiToolRegistryService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiToolRegistryFindToolByNameUseCase,
    (provider) =>
      new FindToolByNameUseCase(
        provider.resolve<AiToolRegistryService>(InfrastructureTokens.AiToolRegistryService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiToolRegistryListToolsByCategoryUseCase,
    (provider) =>
      new ListToolsByCategoryUseCase(
        provider.resolve<AiToolRegistryService>(InfrastructureTokens.AiToolRegistryService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiToolRegistryGetToolRegistryStatisticsUseCase,
    (provider) =>
      new GetToolRegistryStatisticsUseCase(
        provider.resolve<AiToolRegistryService>(InfrastructureTokens.AiToolRegistryService),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiToolRegistryApplicationService,
    (provider) =>
      new AiToolRegistryApplicationService(
        provider.resolve<RegisterToolUseCase>(
          InfrastructureTokens.AiToolRegistryRegisterToolUseCase,
        ),
        provider.resolve<GetToolUseCase>(InfrastructureTokens.AiToolRegistryGetToolUseCase),
        provider.resolve<ListToolsUseCase>(InfrastructureTokens.AiToolRegistryListToolsUseCase),
        provider.resolve<UpdateToolUseCase>(InfrastructureTokens.AiToolRegistryUpdateToolUseCase),
        provider.resolve<DeleteToolUseCase>(InfrastructureTokens.AiToolRegistryDeleteToolUseCase),
        provider.resolve<FindToolByNameUseCase>(
          InfrastructureTokens.AiToolRegistryFindToolByNameUseCase,
        ),
        provider.resolve<ListToolsByCategoryUseCase>(
          InfrastructureTokens.AiToolRegistryListToolsByCategoryUseCase,
        ),
        provider.resolve<GetToolRegistryStatisticsUseCase>(
          InfrastructureTokens.AiToolRegistryGetToolRegistryStatisticsUseCase,
        ),
      ),
  );
}
