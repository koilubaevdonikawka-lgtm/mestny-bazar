import type { IStrategyCatalog } from "@server/application/ai-strategy-registry/contracts/strategy-catalog.contract";
import type { IStrategyRepository } from "@server/application/ai-strategy-registry/contracts/strategy-repository.contract";
import type { IStrategySerializer } from "@server/application/ai-strategy-registry/contracts/strategy-serializer.contract";
import type { IStrategyStatisticsProvider } from "@server/application/ai-strategy-registry/contracts/strategy-statistics-provider.contract";
import type { IStrategyValidator } from "@server/application/ai-strategy-registry/contracts/strategy-validator.contract";
import {
  AiStrategyRegistryApplicationService,
  AiStrategyRegistryService,
  DeleteStrategyUseCase,
  FindStrategyByNameUseCase,
  GetStrategyRegistryStatisticsUseCase,
  GetStrategyUseCase,
  ListStrategiesByCategoryUseCase,
  ListStrategiesUseCase,
  RegisterStrategyUseCase,
  UpdateStrategyUseCase,
} from "@server/application/ai-strategy-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { StrategyRepository } from "@server/infrastructure/ai-strategy-registry/strategy.repository";
import { DefaultStrategyCatalog } from "@server/infrastructure/ai-strategy-registry/default-strategy.catalog";
import { DefaultStrategyStatisticsProvider } from "@server/infrastructure/ai-strategy-registry/default-strategy-statistics.provider";
import { DefaultStrategyValidator } from "@server/infrastructure/ai-strategy-registry/default-strategy.validator";
import { JsonStrategySerializer } from "@server/infrastructure/ai-strategy-registry/json-strategy.serializer";

/** Registers AI Strategy Registry services and use cases. */
export function registerAiStrategyRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiStrategyRegistryStrategyRepository,
    () => new StrategyRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiStrategyRegistryStrategyCatalog,
    () => new DefaultStrategyCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiStrategyRegistryStrategyValidator,
    () => new DefaultStrategyValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiStrategyRegistryStrategySerializer,
    () => new JsonStrategySerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiStrategyRegistryStrategyStatisticsProvider,
    () => new DefaultStrategyStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiStrategyRegistryService,
    (provider) =>
      new AiStrategyRegistryService(
        provider.resolve<IStrategyRepository>(
          InfrastructureTokens.AiStrategyRegistryStrategyRepository,
        ),
        provider.resolve<IStrategyCatalog>(
          InfrastructureTokens.AiStrategyRegistryStrategyCatalog,
        ),
        provider.resolve<IStrategyValidator>(
          InfrastructureTokens.AiStrategyRegistryStrategyValidator,
        ),
        provider.resolve<IStrategySerializer>(
          InfrastructureTokens.AiStrategyRegistryStrategySerializer,
        ),
        provider.resolve<IStrategyStatisticsProvider>(
          InfrastructureTokens.AiStrategyRegistryStrategyStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiStrategyRegistryRegisterStrategyUseCase,
    (provider) =>
      new RegisterStrategyUseCase(
        provider.resolve<AiStrategyRegistryService>(
          InfrastructureTokens.AiStrategyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiStrategyRegistryGetStrategyUseCase,
    (provider) =>
      new GetStrategyUseCase(
        provider.resolve<AiStrategyRegistryService>(
          InfrastructureTokens.AiStrategyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiStrategyRegistryListStrategiesUseCase,
    (provider) =>
      new ListStrategiesUseCase(
        provider.resolve<AiStrategyRegistryService>(
          InfrastructureTokens.AiStrategyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiStrategyRegistryUpdateStrategyUseCase,
    (provider) =>
      new UpdateStrategyUseCase(
        provider.resolve<AiStrategyRegistryService>(
          InfrastructureTokens.AiStrategyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiStrategyRegistryDeleteStrategyUseCase,
    (provider) =>
      new DeleteStrategyUseCase(
        provider.resolve<AiStrategyRegistryService>(
          InfrastructureTokens.AiStrategyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiStrategyRegistryFindStrategyByNameUseCase,
    (provider) =>
      new FindStrategyByNameUseCase(
        provider.resolve<AiStrategyRegistryService>(
          InfrastructureTokens.AiStrategyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiStrategyRegistryListStrategiesByCategoryUseCase,
    (provider) =>
      new ListStrategiesByCategoryUseCase(
        provider.resolve<AiStrategyRegistryService>(
          InfrastructureTokens.AiStrategyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiStrategyRegistryGetStrategyRegistryStatisticsUseCase,
    (provider) =>
      new GetStrategyRegistryStatisticsUseCase(
        provider.resolve<AiStrategyRegistryService>(
          InfrastructureTokens.AiStrategyRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiStrategyRegistryApplicationService,
    (provider) =>
      new AiStrategyRegistryApplicationService(
        provider.resolve<RegisterStrategyUseCase>(
          InfrastructureTokens.AiStrategyRegistryRegisterStrategyUseCase,
        ),
        provider.resolve<GetStrategyUseCase>(
          InfrastructureTokens.AiStrategyRegistryGetStrategyUseCase,
        ),
        provider.resolve<ListStrategiesUseCase>(
          InfrastructureTokens.AiStrategyRegistryListStrategiesUseCase,
        ),
        provider.resolve<UpdateStrategyUseCase>(
          InfrastructureTokens.AiStrategyRegistryUpdateStrategyUseCase,
        ),
        provider.resolve<DeleteStrategyUseCase>(
          InfrastructureTokens.AiStrategyRegistryDeleteStrategyUseCase,
        ),
        provider.resolve<FindStrategyByNameUseCase>(
          InfrastructureTokens.AiStrategyRegistryFindStrategyByNameUseCase,
        ),
        provider.resolve<ListStrategiesByCategoryUseCase>(
          InfrastructureTokens.AiStrategyRegistryListStrategiesByCategoryUseCase,
        ),
        provider.resolve<GetStrategyRegistryStatisticsUseCase>(
          InfrastructureTokens.AiStrategyRegistryGetStrategyRegistryStatisticsUseCase,
        ),
      ),
  );
}
