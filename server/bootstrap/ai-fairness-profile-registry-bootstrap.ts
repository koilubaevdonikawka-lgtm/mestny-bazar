import type { IFairnessProfileCatalog } from "@server/application/ai-fairness-profile-registry/contracts/fairness-profile-catalog.contract";
import type { IFairnessProfileRepository } from "@server/application/ai-fairness-profile-registry/contracts/fairness-profile-repository.contract";
import type { IFairnessProfileSerializer } from "@server/application/ai-fairness-profile-registry/contracts/fairness-profile-serializer.contract";
import type { IFairnessProfileStatisticsProvider } from "@server/application/ai-fairness-profile-registry/contracts/fairness-profile-statistics-provider.contract";
import type { IFairnessProfileValidator } from "@server/application/ai-fairness-profile-registry/contracts/fairness-profile-validator.contract";
import {
  AiFairnessProfileRegistryApplicationService,
  AiFairnessProfileRegistryService,
  DeleteFairnessProfileUseCase,
  FindFairnessProfileByNameUseCase,
  GetFairnessProfileRegistryStatisticsUseCase,
  GetFairnessProfileUseCase,
  ListFairnessProfilesByCategoryUseCase,
  ListFairnessProfilesUseCase,
  RegisterFairnessProfileUseCase,
  UpdateFairnessProfileUseCase,
} from "@server/application/ai-fairness-profile-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { FairnessProfileRepository } from "@server/infrastructure/ai-fairness-profile-registry/fairness-profile.repository";
import { DefaultFairnessProfileCatalog } from "@server/infrastructure/ai-fairness-profile-registry/default-fairness-profile.catalog";
import { DefaultFairnessProfileStatisticsProvider } from "@server/infrastructure/ai-fairness-profile-registry/default-fairness-profile-statistics.provider";
import { DefaultFairnessProfileValidator } from "@server/infrastructure/ai-fairness-profile-registry/default-fairness-profile.validator";
import { JsonFairnessProfileSerializer } from "@server/infrastructure/ai-fairness-profile-registry/json-fairness-profile.serializer";

/** Registers AI Fairness Profile Registry services and use cases. */
export function registerAiFairnessProfileRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiFairnessProfileRegistryFairnessProfileRepository,
    () => new FairnessProfileRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiFairnessProfileRegistryFairnessProfileCatalog,
    () => new DefaultFairnessProfileCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiFairnessProfileRegistryFairnessProfileValidator,
    () => new DefaultFairnessProfileValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiFairnessProfileRegistryFairnessProfileSerializer,
    () => new JsonFairnessProfileSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiFairnessProfileRegistryFairnessProfileStatisticsProvider,
    () => new DefaultFairnessProfileStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiFairnessProfileRegistryService,
    (provider) =>
      new AiFairnessProfileRegistryService(
        provider.resolve<IFairnessProfileRepository>(
          InfrastructureTokens.AiFairnessProfileRegistryFairnessProfileRepository,
        ),
        provider.resolve<IFairnessProfileCatalog>(
          InfrastructureTokens.AiFairnessProfileRegistryFairnessProfileCatalog,
        ),
        provider.resolve<IFairnessProfileValidator>(
          InfrastructureTokens.AiFairnessProfileRegistryFairnessProfileValidator,
        ),
        provider.resolve<IFairnessProfileSerializer>(
          InfrastructureTokens.AiFairnessProfileRegistryFairnessProfileSerializer,
        ),
        provider.resolve<IFairnessProfileStatisticsProvider>(
          InfrastructureTokens.AiFairnessProfileRegistryFairnessProfileStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiFairnessProfileRegistryRegisterFairnessProfileUseCase,
    (provider) =>
      new RegisterFairnessProfileUseCase(
        provider.resolve<AiFairnessProfileRegistryService>(
          InfrastructureTokens.AiFairnessProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiFairnessProfileRegistryGetFairnessProfileUseCase,
    (provider) =>
      new GetFairnessProfileUseCase(
        provider.resolve<AiFairnessProfileRegistryService>(
          InfrastructureTokens.AiFairnessProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiFairnessProfileRegistryListFairnessProfilesUseCase,
    (provider) =>
      new ListFairnessProfilesUseCase(
        provider.resolve<AiFairnessProfileRegistryService>(
          InfrastructureTokens.AiFairnessProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiFairnessProfileRegistryUpdateFairnessProfileUseCase,
    (provider) =>
      new UpdateFairnessProfileUseCase(
        provider.resolve<AiFairnessProfileRegistryService>(
          InfrastructureTokens.AiFairnessProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiFairnessProfileRegistryDeleteFairnessProfileUseCase,
    (provider) =>
      new DeleteFairnessProfileUseCase(
        provider.resolve<AiFairnessProfileRegistryService>(
          InfrastructureTokens.AiFairnessProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiFairnessProfileRegistryFindFairnessProfileByNameUseCase,
    (provider) =>
      new FindFairnessProfileByNameUseCase(
        provider.resolve<AiFairnessProfileRegistryService>(
          InfrastructureTokens.AiFairnessProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiFairnessProfileRegistryListFairnessProfilesByCategoryUseCase,
    (provider) =>
      new ListFairnessProfilesByCategoryUseCase(
        provider.resolve<AiFairnessProfileRegistryService>(
          InfrastructureTokens.AiFairnessProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiFairnessProfileRegistryGetFairnessProfileRegistryStatisticsUseCase,
    (provider) =>
      new GetFairnessProfileRegistryStatisticsUseCase(
        provider.resolve<AiFairnessProfileRegistryService>(
          InfrastructureTokens.AiFairnessProfileRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiFairnessProfileRegistryApplicationService,
    (provider) =>
      new AiFairnessProfileRegistryApplicationService(
        provider.resolve<RegisterFairnessProfileUseCase>(
          InfrastructureTokens.AiFairnessProfileRegistryRegisterFairnessProfileUseCase,
        ),
        provider.resolve<GetFairnessProfileUseCase>(
          InfrastructureTokens.AiFairnessProfileRegistryGetFairnessProfileUseCase,
        ),
        provider.resolve<ListFairnessProfilesUseCase>(
          InfrastructureTokens.AiFairnessProfileRegistryListFairnessProfilesUseCase,
        ),
        provider.resolve<UpdateFairnessProfileUseCase>(
          InfrastructureTokens.AiFairnessProfileRegistryUpdateFairnessProfileUseCase,
        ),
        provider.resolve<DeleteFairnessProfileUseCase>(
          InfrastructureTokens.AiFairnessProfileRegistryDeleteFairnessProfileUseCase,
        ),
        provider.resolve<FindFairnessProfileByNameUseCase>(
          InfrastructureTokens.AiFairnessProfileRegistryFindFairnessProfileByNameUseCase,
        ),
        provider.resolve<ListFairnessProfilesByCategoryUseCase>(
          InfrastructureTokens.AiFairnessProfileRegistryListFairnessProfilesByCategoryUseCase,
        ),
        provider.resolve<GetFairnessProfileRegistryStatisticsUseCase>(
          InfrastructureTokens.AiFairnessProfileRegistryGetFairnessProfileRegistryStatisticsUseCase,
        ),
      ),
  );
}
