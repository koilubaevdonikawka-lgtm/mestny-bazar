import type { IDeploymentProfileCatalog } from "@server/application/ai-deployment-profile-registry/contracts/deployment-profile-catalog.contract";
import type { IDeploymentProfileRepository } from "@server/application/ai-deployment-profile-registry/contracts/deployment-profile-repository.contract";
import type { IDeploymentProfileSerializer } from "@server/application/ai-deployment-profile-registry/contracts/deployment-profile-serializer.contract";
import type { IDeploymentProfileStatisticsProvider } from "@server/application/ai-deployment-profile-registry/contracts/deployment-profile-statistics-provider.contract";
import type { IDeploymentProfileValidator } from "@server/application/ai-deployment-profile-registry/contracts/deployment-profile-validator.contract";
import {
  AiDeploymentProfileRegistryApplicationService,
  AiDeploymentProfileRegistryService,
  DeleteDeploymentProfileUseCase,
  FindDeploymentProfileByNameUseCase,
  GetDeploymentProfileRegistryStatisticsUseCase,
  GetDeploymentProfileUseCase,
  ListDeploymentProfilesByCategoryUseCase,
  ListDeploymentProfilesUseCase,
  RegisterDeploymentProfileUseCase,
  UpdateDeploymentProfileUseCase,
} from "@server/application/ai-deployment-profile-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { DeploymentProfileRepository } from "@server/infrastructure/ai-deployment-profile-registry/deployment-profile.repository";
import { DefaultDeploymentProfileCatalog } from "@server/infrastructure/ai-deployment-profile-registry/default-deployment-profile.catalog";
import { DefaultDeploymentProfileStatisticsProvider } from "@server/infrastructure/ai-deployment-profile-registry/default-deployment-profile-statistics.provider";
import { DefaultDeploymentProfileValidator } from "@server/infrastructure/ai-deployment-profile-registry/default-deployment-profile.validator";
import { JsonDeploymentProfileSerializer } from "@server/infrastructure/ai-deployment-profile-registry/json-deployment-profile.serializer";

/** Registers AI Deployment Profile Registry services and use cases. */
export function registerAiDeploymentProfileRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiDeploymentProfileRegistryDeploymentProfileRepository,
    () => new DeploymentProfileRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiDeploymentProfileRegistryDeploymentProfileCatalog,
    () => new DefaultDeploymentProfileCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiDeploymentProfileRegistryDeploymentProfileValidator,
    () => new DefaultDeploymentProfileValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiDeploymentProfileRegistryDeploymentProfileSerializer,
    () => new JsonDeploymentProfileSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiDeploymentProfileRegistryDeploymentProfileStatisticsProvider,
    () => new DefaultDeploymentProfileStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiDeploymentProfileRegistryService,
    (provider) =>
      new AiDeploymentProfileRegistryService(
        provider.resolve<IDeploymentProfileRepository>(
          InfrastructureTokens.AiDeploymentProfileRegistryDeploymentProfileRepository,
        ),
        provider.resolve<IDeploymentProfileCatalog>(
          InfrastructureTokens.AiDeploymentProfileRegistryDeploymentProfileCatalog,
        ),
        provider.resolve<IDeploymentProfileValidator>(
          InfrastructureTokens.AiDeploymentProfileRegistryDeploymentProfileValidator,
        ),
        provider.resolve<IDeploymentProfileSerializer>(
          InfrastructureTokens.AiDeploymentProfileRegistryDeploymentProfileSerializer,
        ),
        provider.resolve<IDeploymentProfileStatisticsProvider>(
          InfrastructureTokens.AiDeploymentProfileRegistryDeploymentProfileStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiDeploymentProfileRegistryRegisterDeploymentProfileUseCase,
    (provider) =>
      new RegisterDeploymentProfileUseCase(
        provider.resolve<AiDeploymentProfileRegistryService>(
          InfrastructureTokens.AiDeploymentProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiDeploymentProfileRegistryGetDeploymentProfileUseCase,
    (provider) =>
      new GetDeploymentProfileUseCase(
        provider.resolve<AiDeploymentProfileRegistryService>(
          InfrastructureTokens.AiDeploymentProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiDeploymentProfileRegistryListDeploymentProfilesUseCase,
    (provider) =>
      new ListDeploymentProfilesUseCase(
        provider.resolve<AiDeploymentProfileRegistryService>(
          InfrastructureTokens.AiDeploymentProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiDeploymentProfileRegistryUpdateDeploymentProfileUseCase,
    (provider) =>
      new UpdateDeploymentProfileUseCase(
        provider.resolve<AiDeploymentProfileRegistryService>(
          InfrastructureTokens.AiDeploymentProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiDeploymentProfileRegistryDeleteDeploymentProfileUseCase,
    (provider) =>
      new DeleteDeploymentProfileUseCase(
        provider.resolve<AiDeploymentProfileRegistryService>(
          InfrastructureTokens.AiDeploymentProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiDeploymentProfileRegistryFindDeploymentProfileByNameUseCase,
    (provider) =>
      new FindDeploymentProfileByNameUseCase(
        provider.resolve<AiDeploymentProfileRegistryService>(
          InfrastructureTokens.AiDeploymentProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiDeploymentProfileRegistryListDeploymentProfilesByCategoryUseCase,
    (provider) =>
      new ListDeploymentProfilesByCategoryUseCase(
        provider.resolve<AiDeploymentProfileRegistryService>(
          InfrastructureTokens.AiDeploymentProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiDeploymentProfileRegistryGetDeploymentProfileRegistryStatisticsUseCase,
    (provider) =>
      new GetDeploymentProfileRegistryStatisticsUseCase(
        provider.resolve<AiDeploymentProfileRegistryService>(
          InfrastructureTokens.AiDeploymentProfileRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiDeploymentProfileRegistryApplicationService,
    (provider) =>
      new AiDeploymentProfileRegistryApplicationService(
        provider.resolve<RegisterDeploymentProfileUseCase>(
          InfrastructureTokens.AiDeploymentProfileRegistryRegisterDeploymentProfileUseCase,
        ),
        provider.resolve<GetDeploymentProfileUseCase>(
          InfrastructureTokens.AiDeploymentProfileRegistryGetDeploymentProfileUseCase,
        ),
        provider.resolve<ListDeploymentProfilesUseCase>(
          InfrastructureTokens.AiDeploymentProfileRegistryListDeploymentProfilesUseCase,
        ),
        provider.resolve<UpdateDeploymentProfileUseCase>(
          InfrastructureTokens.AiDeploymentProfileRegistryUpdateDeploymentProfileUseCase,
        ),
        provider.resolve<DeleteDeploymentProfileUseCase>(
          InfrastructureTokens.AiDeploymentProfileRegistryDeleteDeploymentProfileUseCase,
        ),
        provider.resolve<FindDeploymentProfileByNameUseCase>(
          InfrastructureTokens.AiDeploymentProfileRegistryFindDeploymentProfileByNameUseCase,
        ),
        provider.resolve<ListDeploymentProfilesByCategoryUseCase>(
          InfrastructureTokens.AiDeploymentProfileRegistryListDeploymentProfilesByCategoryUseCase,
        ),
        provider.resolve<GetDeploymentProfileRegistryStatisticsUseCase>(
          InfrastructureTokens.AiDeploymentProfileRegistryGetDeploymentProfileRegistryStatisticsUseCase,
        ),
      ),
  );
}
