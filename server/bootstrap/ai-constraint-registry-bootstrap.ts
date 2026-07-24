import type { IConstraintCatalog } from "@server/application/ai-constraint-registry/contracts/constraint-catalog.contract";
import type { IConstraintRepository } from "@server/application/ai-constraint-registry/contracts/constraint-repository.contract";
import type { IConstraintSerializer } from "@server/application/ai-constraint-registry/contracts/constraint-serializer.contract";
import type { IConstraintStatisticsProvider } from "@server/application/ai-constraint-registry/contracts/constraint-statistics-provider.contract";
import type { IConstraintValidator } from "@server/application/ai-constraint-registry/contracts/constraint-validator.contract";
import {
  AiConstraintRegistryApplicationService,
  AiConstraintRegistryService,
  DeleteConstraintUseCase,
  FindConstraintByNameUseCase,
  GetConstraintRegistryStatisticsUseCase,
  GetConstraintUseCase,
  ListConstraintsByCategoryUseCase,
  ListConstraintsUseCase,
  RegisterConstraintUseCase,
  UpdateConstraintUseCase,
} from "@server/application/ai-constraint-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { ConstraintRepository } from "@server/infrastructure/ai-constraint-registry/constraint.repository";
import { DefaultConstraintCatalog } from "@server/infrastructure/ai-constraint-registry/default-constraint.catalog";
import { DefaultConstraintStatisticsProvider } from "@server/infrastructure/ai-constraint-registry/default-constraint-statistics.provider";
import { DefaultConstraintValidator } from "@server/infrastructure/ai-constraint-registry/default-constraint.validator";
import { JsonConstraintSerializer } from "@server/infrastructure/ai-constraint-registry/json-constraint.serializer";

/** Registers AI Constraint Registry services and use cases. */
export function registerAiConstraintRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiConstraintRegistryConstraintRepository,
    () => new ConstraintRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiConstraintRegistryConstraintCatalog,
    () => new DefaultConstraintCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiConstraintRegistryConstraintValidator,
    () => new DefaultConstraintValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiConstraintRegistryConstraintSerializer,
    () => new JsonConstraintSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiConstraintRegistryConstraintStatisticsProvider,
    () => new DefaultConstraintStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiConstraintRegistryService,
    (provider) =>
      new AiConstraintRegistryService(
        provider.resolve<IConstraintRepository>(
          InfrastructureTokens.AiConstraintRegistryConstraintRepository,
        ),
        provider.resolve<IConstraintCatalog>(
          InfrastructureTokens.AiConstraintRegistryConstraintCatalog,
        ),
        provider.resolve<IConstraintValidator>(
          InfrastructureTokens.AiConstraintRegistryConstraintValidator,
        ),
        provider.resolve<IConstraintSerializer>(
          InfrastructureTokens.AiConstraintRegistryConstraintSerializer,
        ),
        provider.resolve<IConstraintStatisticsProvider>(
          InfrastructureTokens.AiConstraintRegistryConstraintStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiConstraintRegistryRegisterConstraintUseCase,
    (provider) =>
      new RegisterConstraintUseCase(
        provider.resolve<AiConstraintRegistryService>(
          InfrastructureTokens.AiConstraintRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiConstraintRegistryGetConstraintUseCase,
    (provider) =>
      new GetConstraintUseCase(
        provider.resolve<AiConstraintRegistryService>(
          InfrastructureTokens.AiConstraintRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiConstraintRegistryListConstraintsUseCase,
    (provider) =>
      new ListConstraintsUseCase(
        provider.resolve<AiConstraintRegistryService>(
          InfrastructureTokens.AiConstraintRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiConstraintRegistryUpdateConstraintUseCase,
    (provider) =>
      new UpdateConstraintUseCase(
        provider.resolve<AiConstraintRegistryService>(
          InfrastructureTokens.AiConstraintRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiConstraintRegistryDeleteConstraintUseCase,
    (provider) =>
      new DeleteConstraintUseCase(
        provider.resolve<AiConstraintRegistryService>(
          InfrastructureTokens.AiConstraintRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiConstraintRegistryFindConstraintByNameUseCase,
    (provider) =>
      new FindConstraintByNameUseCase(
        provider.resolve<AiConstraintRegistryService>(
          InfrastructureTokens.AiConstraintRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiConstraintRegistryListConstraintsByCategoryUseCase,
    (provider) =>
      new ListConstraintsByCategoryUseCase(
        provider.resolve<AiConstraintRegistryService>(
          InfrastructureTokens.AiConstraintRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiConstraintRegistryGetConstraintRegistryStatisticsUseCase,
    (provider) =>
      new GetConstraintRegistryStatisticsUseCase(
        provider.resolve<AiConstraintRegistryService>(
          InfrastructureTokens.AiConstraintRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiConstraintRegistryApplicationService,
    (provider) =>
      new AiConstraintRegistryApplicationService(
        provider.resolve<RegisterConstraintUseCase>(
          InfrastructureTokens.AiConstraintRegistryRegisterConstraintUseCase,
        ),
        provider.resolve<GetConstraintUseCase>(
          InfrastructureTokens.AiConstraintRegistryGetConstraintUseCase,
        ),
        provider.resolve<ListConstraintsUseCase>(
          InfrastructureTokens.AiConstraintRegistryListConstraintsUseCase,
        ),
        provider.resolve<UpdateConstraintUseCase>(
          InfrastructureTokens.AiConstraintRegistryUpdateConstraintUseCase,
        ),
        provider.resolve<DeleteConstraintUseCase>(
          InfrastructureTokens.AiConstraintRegistryDeleteConstraintUseCase,
        ),
        provider.resolve<FindConstraintByNameUseCase>(
          InfrastructureTokens.AiConstraintRegistryFindConstraintByNameUseCase,
        ),
        provider.resolve<ListConstraintsByCategoryUseCase>(
          InfrastructureTokens.AiConstraintRegistryListConstraintsByCategoryUseCase,
        ),
        provider.resolve<GetConstraintRegistryStatisticsUseCase>(
          InfrastructureTokens.AiConstraintRegistryGetConstraintRegistryStatisticsUseCase,
        ),
      ),
  );
}
