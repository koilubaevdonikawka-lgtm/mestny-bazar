import type { IPromptCatalog } from "@server/application/ai-prompt-registry/contracts/prompt-catalog.contract";
import type { IPromptRepository } from "@server/application/ai-prompt-registry/contracts/prompt-repository.contract";
import type { IPromptSerializer } from "@server/application/ai-prompt-registry/contracts/prompt-serializer.contract";
import type { IPromptStatisticsProvider } from "@server/application/ai-prompt-registry/contracts/prompt-statistics-provider.contract";
import type { IPromptValidator } from "@server/application/ai-prompt-registry/contracts/prompt-validator.contract";
import {
  AiPromptRegistryApplicationService,
  AiPromptRegistryService,
  DeletePromptUseCase,
  FindPromptByNameUseCase,
  GetPromptRegistryStatisticsUseCase,
  GetPromptUseCase,
  ListPromptsByCategoryUseCase,
  ListPromptsUseCase,
  RegisterPromptUseCase,
  UpdatePromptUseCase,
} from "@server/application/ai-prompt-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { DefaultPromptCatalog } from "@server/infrastructure/ai-prompt-registry/default-prompt.catalog";
import { DefaultPromptStatisticsProvider } from "@server/infrastructure/ai-prompt-registry/default-prompt-statistics.provider";
import { DefaultPromptValidator } from "@server/infrastructure/ai-prompt-registry/default-prompt.validator";
import { JsonPromptSerializer } from "@server/infrastructure/ai-prompt-registry/json-prompt.serializer";
import { PromptRepository } from "@server/infrastructure/ai-prompt-registry/prompt.repository";

/** Registers AI Prompt Registry services and use cases. */
export function registerAiPromptRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiPromptRegistryPromptRepository,
    () => new PromptRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiPromptRegistryPromptCatalog,
    () => new DefaultPromptCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiPromptRegistryPromptValidator,
    () => new DefaultPromptValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiPromptRegistryPromptSerializer,
    () => new JsonPromptSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiPromptRegistryPromptStatisticsProvider,
    () => new DefaultPromptStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiPromptRegistryService,
    (provider) =>
      new AiPromptRegistryService(
        provider.resolve<IPromptRepository>(
          InfrastructureTokens.AiPromptRegistryPromptRepository,
        ),
        provider.resolve<IPromptCatalog>(
          InfrastructureTokens.AiPromptRegistryPromptCatalog,
        ),
        provider.resolve<IPromptValidator>(
          InfrastructureTokens.AiPromptRegistryPromptValidator,
        ),
        provider.resolve<IPromptSerializer>(
          InfrastructureTokens.AiPromptRegistryPromptSerializer,
        ),
        provider.resolve<IPromptStatisticsProvider>(
          InfrastructureTokens.AiPromptRegistryPromptStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiPromptRegistryRegisterPromptUseCase,
    (provider) =>
      new RegisterPromptUseCase(
        provider.resolve<AiPromptRegistryService>(InfrastructureTokens.AiPromptRegistryService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPromptRegistryGetPromptUseCase,
    (provider) =>
      new GetPromptUseCase(
        provider.resolve<AiPromptRegistryService>(InfrastructureTokens.AiPromptRegistryService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPromptRegistryListPromptsUseCase,
    (provider) =>
      new ListPromptsUseCase(
        provider.resolve<AiPromptRegistryService>(InfrastructureTokens.AiPromptRegistryService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPromptRegistryUpdatePromptUseCase,
    (provider) =>
      new UpdatePromptUseCase(
        provider.resolve<AiPromptRegistryService>(InfrastructureTokens.AiPromptRegistryService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPromptRegistryDeletePromptUseCase,
    (provider) =>
      new DeletePromptUseCase(
        provider.resolve<AiPromptRegistryService>(InfrastructureTokens.AiPromptRegistryService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPromptRegistryFindPromptByNameUseCase,
    (provider) =>
      new FindPromptByNameUseCase(
        provider.resolve<AiPromptRegistryService>(InfrastructureTokens.AiPromptRegistryService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPromptRegistryListPromptsByCategoryUseCase,
    (provider) =>
      new ListPromptsByCategoryUseCase(
        provider.resolve<AiPromptRegistryService>(InfrastructureTokens.AiPromptRegistryService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPromptRegistryGetPromptRegistryStatisticsUseCase,
    (provider) =>
      new GetPromptRegistryStatisticsUseCase(
        provider.resolve<AiPromptRegistryService>(InfrastructureTokens.AiPromptRegistryService),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiPromptRegistryApplicationService,
    (provider) =>
      new AiPromptRegistryApplicationService(
        provider.resolve<RegisterPromptUseCase>(
          InfrastructureTokens.AiPromptRegistryRegisterPromptUseCase,
        ),
        provider.resolve<GetPromptUseCase>(
          InfrastructureTokens.AiPromptRegistryGetPromptUseCase,
        ),
        provider.resolve<ListPromptsUseCase>(
          InfrastructureTokens.AiPromptRegistryListPromptsUseCase,
        ),
        provider.resolve<UpdatePromptUseCase>(
          InfrastructureTokens.AiPromptRegistryUpdatePromptUseCase,
        ),
        provider.resolve<DeletePromptUseCase>(
          InfrastructureTokens.AiPromptRegistryDeletePromptUseCase,
        ),
        provider.resolve<FindPromptByNameUseCase>(
          InfrastructureTokens.AiPromptRegistryFindPromptByNameUseCase,
        ),
        provider.resolve<ListPromptsByCategoryUseCase>(
          InfrastructureTokens.AiPromptRegistryListPromptsByCategoryUseCase,
        ),
        provider.resolve<GetPromptRegistryStatisticsUseCase>(
          InfrastructureTokens.AiPromptRegistryGetPromptRegistryStatisticsUseCase,
        ),
      ),
  );
}
