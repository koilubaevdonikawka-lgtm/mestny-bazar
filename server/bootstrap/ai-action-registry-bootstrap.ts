import type { IActionCatalog } from "@server/application/ai-action-registry/contracts/action-catalog.contract";
import type { IActionRepository } from "@server/application/ai-action-registry/contracts/action-repository.contract";
import type { IActionSerializer } from "@server/application/ai-action-registry/contracts/action-serializer.contract";
import type { IActionStatisticsProvider } from "@server/application/ai-action-registry/contracts/action-statistics-provider.contract";
import type { IActionValidator } from "@server/application/ai-action-registry/contracts/action-validator.contract";
import {
  AiActionRegistryApplicationService,
  AiActionRegistryService,
  DeleteActionUseCase,
  FindActionByNameUseCase,
  GetActionRegistryStatisticsUseCase,
  GetActionUseCase,
  ListActionsByCategoryUseCase,
  ListActionsUseCase,
  RegisterActionUseCase,
  UpdateActionUseCase,
} from "@server/application/ai-action-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { ActionRepository } from "@server/infrastructure/ai-action-registry/action.repository";
import { DefaultActionCatalog } from "@server/infrastructure/ai-action-registry/default-action.catalog";
import { DefaultActionStatisticsProvider } from "@server/infrastructure/ai-action-registry/default-action-statistics.provider";
import { DefaultActionValidator } from "@server/infrastructure/ai-action-registry/default-action.validator";
import { JsonActionSerializer } from "@server/infrastructure/ai-action-registry/json-action.serializer";

/** Registers AI Action Registry services and use cases. */
export function registerAiActionRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiActionRegistryActionRepository,
    () => new ActionRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiActionRegistryActionCatalog,
    () => new DefaultActionCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiActionRegistryActionValidator,
    () => new DefaultActionValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiActionRegistryActionSerializer,
    () => new JsonActionSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiActionRegistryActionStatisticsProvider,
    () => new DefaultActionStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiActionRegistryService,
    (provider) =>
      new AiActionRegistryService(
        provider.resolve<IActionRepository>(
          InfrastructureTokens.AiActionRegistryActionRepository,
        ),
        provider.resolve<IActionCatalog>(
          InfrastructureTokens.AiActionRegistryActionCatalog,
        ),
        provider.resolve<IActionValidator>(
          InfrastructureTokens.AiActionRegistryActionValidator,
        ),
        provider.resolve<IActionSerializer>(
          InfrastructureTokens.AiActionRegistryActionSerializer,
        ),
        provider.resolve<IActionStatisticsProvider>(
          InfrastructureTokens.AiActionRegistryActionStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiActionRegistryRegisterActionUseCase,
    (provider) =>
      new RegisterActionUseCase(
        provider.resolve<AiActionRegistryService>(
          InfrastructureTokens.AiActionRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiActionRegistryGetActionUseCase,
    (provider) =>
      new GetActionUseCase(
        provider.resolve<AiActionRegistryService>(
          InfrastructureTokens.AiActionRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiActionRegistryListActionsUseCase,
    (provider) =>
      new ListActionsUseCase(
        provider.resolve<AiActionRegistryService>(
          InfrastructureTokens.AiActionRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiActionRegistryUpdateActionUseCase,
    (provider) =>
      new UpdateActionUseCase(
        provider.resolve<AiActionRegistryService>(
          InfrastructureTokens.AiActionRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiActionRegistryDeleteActionUseCase,
    (provider) =>
      new DeleteActionUseCase(
        provider.resolve<AiActionRegistryService>(
          InfrastructureTokens.AiActionRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiActionRegistryFindActionByNameUseCase,
    (provider) =>
      new FindActionByNameUseCase(
        provider.resolve<AiActionRegistryService>(
          InfrastructureTokens.AiActionRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiActionRegistryListActionsByCategoryUseCase,
    (provider) =>
      new ListActionsByCategoryUseCase(
        provider.resolve<AiActionRegistryService>(
          InfrastructureTokens.AiActionRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiActionRegistryGetActionRegistryStatisticsUseCase,
    (provider) =>
      new GetActionRegistryStatisticsUseCase(
        provider.resolve<AiActionRegistryService>(
          InfrastructureTokens.AiActionRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiActionRegistryApplicationService,
    (provider) =>
      new AiActionRegistryApplicationService(
        provider.resolve<RegisterActionUseCase>(
          InfrastructureTokens.AiActionRegistryRegisterActionUseCase,
        ),
        provider.resolve<GetActionUseCase>(
          InfrastructureTokens.AiActionRegistryGetActionUseCase,
        ),
        provider.resolve<ListActionsUseCase>(
          InfrastructureTokens.AiActionRegistryListActionsUseCase,
        ),
        provider.resolve<UpdateActionUseCase>(
          InfrastructureTokens.AiActionRegistryUpdateActionUseCase,
        ),
        provider.resolve<DeleteActionUseCase>(
          InfrastructureTokens.AiActionRegistryDeleteActionUseCase,
        ),
        provider.resolve<FindActionByNameUseCase>(
          InfrastructureTokens.AiActionRegistryFindActionByNameUseCase,
        ),
        provider.resolve<ListActionsByCategoryUseCase>(
          InfrastructureTokens.AiActionRegistryListActionsByCategoryUseCase,
        ),
        provider.resolve<GetActionRegistryStatisticsUseCase>(
          InfrastructureTokens.AiActionRegistryGetActionRegistryStatisticsUseCase,
        ),
      ),
  );
}
