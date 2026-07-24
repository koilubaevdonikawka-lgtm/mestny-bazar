import type { IExecutionProfileCatalog } from "@server/application/ai-execution-profile-registry/contracts/execution-profile-catalog.contract";
import type { IExecutionProfileRepository } from "@server/application/ai-execution-profile-registry/contracts/execution-profile-repository.contract";
import type { IExecutionProfileSerializer } from "@server/application/ai-execution-profile-registry/contracts/execution-profile-serializer.contract";
import type { IExecutionProfileStatisticsProvider } from "@server/application/ai-execution-profile-registry/contracts/execution-profile-statistics-provider.contract";
import type { IExecutionProfileValidator } from "@server/application/ai-execution-profile-registry/contracts/execution-profile-validator.contract";
import {
  AiExecutionProfileRegistryApplicationService,
  AiExecutionProfileRegistryService,
  DeleteExecutionProfileUseCase,
  FindExecutionProfileByNameUseCase,
  GetExecutionProfileRegistryStatisticsUseCase,
  GetExecutionProfileUseCase,
  ListExecutionProfilesByCategoryUseCase,
  ListExecutionProfilesUseCase,
  RegisterExecutionProfileUseCase,
  UpdateExecutionProfileUseCase,
} from "@server/application/ai-execution-profile-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { ExecutionProfileRepository } from "@server/infrastructure/ai-execution-profile-registry/execution-profile.repository";
import { DefaultExecutionProfileCatalog } from "@server/infrastructure/ai-execution-profile-registry/default-execution-profile.catalog";
import { DefaultExecutionProfileStatisticsProvider } from "@server/infrastructure/ai-execution-profile-registry/default-execution-profile-statistics.provider";
import { DefaultExecutionProfileValidator } from "@server/infrastructure/ai-execution-profile-registry/default-execution-profile.validator";
import { JsonExecutionProfileSerializer } from "@server/infrastructure/ai-execution-profile-registry/json-execution-profile.serializer";

/** Registers AI Execution Profile Registry services and use cases. */
export function registerAiExecutionProfileRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiExecutionProfileRegistryExecutionProfileRepository,
    () => new ExecutionProfileRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiExecutionProfileRegistryExecutionProfileCatalog,
    () => new DefaultExecutionProfileCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiExecutionProfileRegistryExecutionProfileValidator,
    () => new DefaultExecutionProfileValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiExecutionProfileRegistryExecutionProfileSerializer,
    () => new JsonExecutionProfileSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiExecutionProfileRegistryExecutionProfileStatisticsProvider,
    () => new DefaultExecutionProfileStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiExecutionProfileRegistryService,
    (provider) =>
      new AiExecutionProfileRegistryService(
        provider.resolve<IExecutionProfileRepository>(
          InfrastructureTokens.AiExecutionProfileRegistryExecutionProfileRepository,
        ),
        provider.resolve<IExecutionProfileCatalog>(
          InfrastructureTokens.AiExecutionProfileRegistryExecutionProfileCatalog,
        ),
        provider.resolve<IExecutionProfileValidator>(
          InfrastructureTokens.AiExecutionProfileRegistryExecutionProfileValidator,
        ),
        provider.resolve<IExecutionProfileSerializer>(
          InfrastructureTokens.AiExecutionProfileRegistryExecutionProfileSerializer,
        ),
        provider.resolve<IExecutionProfileStatisticsProvider>(
          InfrastructureTokens.AiExecutionProfileRegistryExecutionProfileStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiExecutionProfileRegistryRegisterExecutionProfileUseCase,
    (provider) =>
      new RegisterExecutionProfileUseCase(
        provider.resolve<AiExecutionProfileRegistryService>(
          InfrastructureTokens.AiExecutionProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiExecutionProfileRegistryGetExecutionProfileUseCase,
    (provider) =>
      new GetExecutionProfileUseCase(
        provider.resolve<AiExecutionProfileRegistryService>(
          InfrastructureTokens.AiExecutionProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiExecutionProfileRegistryListExecutionProfilesUseCase,
    (provider) =>
      new ListExecutionProfilesUseCase(
        provider.resolve<AiExecutionProfileRegistryService>(
          InfrastructureTokens.AiExecutionProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiExecutionProfileRegistryUpdateExecutionProfileUseCase,
    (provider) =>
      new UpdateExecutionProfileUseCase(
        provider.resolve<AiExecutionProfileRegistryService>(
          InfrastructureTokens.AiExecutionProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiExecutionProfileRegistryDeleteExecutionProfileUseCase,
    (provider) =>
      new DeleteExecutionProfileUseCase(
        provider.resolve<AiExecutionProfileRegistryService>(
          InfrastructureTokens.AiExecutionProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiExecutionProfileRegistryFindExecutionProfileByNameUseCase,
    (provider) =>
      new FindExecutionProfileByNameUseCase(
        provider.resolve<AiExecutionProfileRegistryService>(
          InfrastructureTokens.AiExecutionProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiExecutionProfileRegistryListExecutionProfilesByCategoryUseCase,
    (provider) =>
      new ListExecutionProfilesByCategoryUseCase(
        provider.resolve<AiExecutionProfileRegistryService>(
          InfrastructureTokens.AiExecutionProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiExecutionProfileRegistryGetExecutionProfileRegistryStatisticsUseCase,
    (provider) =>
      new GetExecutionProfileRegistryStatisticsUseCase(
        provider.resolve<AiExecutionProfileRegistryService>(
          InfrastructureTokens.AiExecutionProfileRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiExecutionProfileRegistryApplicationService,
    (provider) =>
      new AiExecutionProfileRegistryApplicationService(
        provider.resolve<RegisterExecutionProfileUseCase>(
          InfrastructureTokens.AiExecutionProfileRegistryRegisterExecutionProfileUseCase,
        ),
        provider.resolve<GetExecutionProfileUseCase>(
          InfrastructureTokens.AiExecutionProfileRegistryGetExecutionProfileUseCase,
        ),
        provider.resolve<ListExecutionProfilesUseCase>(
          InfrastructureTokens.AiExecutionProfileRegistryListExecutionProfilesUseCase,
        ),
        provider.resolve<UpdateExecutionProfileUseCase>(
          InfrastructureTokens.AiExecutionProfileRegistryUpdateExecutionProfileUseCase,
        ),
        provider.resolve<DeleteExecutionProfileUseCase>(
          InfrastructureTokens.AiExecutionProfileRegistryDeleteExecutionProfileUseCase,
        ),
        provider.resolve<FindExecutionProfileByNameUseCase>(
          InfrastructureTokens.AiExecutionProfileRegistryFindExecutionProfileByNameUseCase,
        ),
        provider.resolve<ListExecutionProfilesByCategoryUseCase>(
          InfrastructureTokens.AiExecutionProfileRegistryListExecutionProfilesByCategoryUseCase,
        ),
        provider.resolve<GetExecutionProfileRegistryStatisticsUseCase>(
          InfrastructureTokens.AiExecutionProfileRegistryGetExecutionProfileRegistryStatisticsUseCase,
        ),
      ),
  );
}
