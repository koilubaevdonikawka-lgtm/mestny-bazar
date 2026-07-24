import type { IValidationProfileCatalog } from "@server/application/ai-validation-profile-registry/contracts/validation-profile-catalog.contract";
import type { IValidationProfileRepository } from "@server/application/ai-validation-profile-registry/contracts/validation-profile-repository.contract";
import type { IValidationProfileSerializer } from "@server/application/ai-validation-profile-registry/contracts/validation-profile-serializer.contract";
import type { IValidationProfileStatisticsProvider } from "@server/application/ai-validation-profile-registry/contracts/validation-profile-statistics-provider.contract";
import type { IValidationProfileValidator } from "@server/application/ai-validation-profile-registry/contracts/validation-profile-validator.contract";
import {
  AiValidationProfileRegistryApplicationService,
  AiValidationProfileRegistryService,
  DeleteValidationProfileUseCase,
  FindValidationProfileByNameUseCase,
  GetValidationProfileRegistryStatisticsUseCase,
  GetValidationProfileUseCase,
  ListValidationProfilesByCategoryUseCase,
  ListValidationProfilesUseCase,
  RegisterValidationProfileUseCase,
  UpdateValidationProfileUseCase,
} from "@server/application/ai-validation-profile-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { ValidationProfileRepository } from "@server/infrastructure/ai-validation-profile-registry/validation-profile.repository";
import { DefaultValidationProfileCatalog } from "@server/infrastructure/ai-validation-profile-registry/default-validation-profile.catalog";
import { DefaultValidationProfileStatisticsProvider } from "@server/infrastructure/ai-validation-profile-registry/default-validation-profile-statistics.provider";
import { DefaultValidationProfileValidator } from "@server/infrastructure/ai-validation-profile-registry/default-validation-profile.validator";
import { JsonValidationProfileSerializer } from "@server/infrastructure/ai-validation-profile-registry/json-validation-profile.serializer";

/** Registers AI Validation Profile Registry services and use cases. */
export function registerAiValidationProfileRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiValidationProfileRegistryValidationProfileRepository,
    () => new ValidationProfileRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiValidationProfileRegistryValidationProfileCatalog,
    () => new DefaultValidationProfileCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiValidationProfileRegistryValidationProfileValidator,
    () => new DefaultValidationProfileValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiValidationProfileRegistryValidationProfileSerializer,
    () => new JsonValidationProfileSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiValidationProfileRegistryValidationProfileStatisticsProvider,
    () => new DefaultValidationProfileStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiValidationProfileRegistryService,
    (provider) =>
      new AiValidationProfileRegistryService(
        provider.resolve<IValidationProfileRepository>(
          InfrastructureTokens.AiValidationProfileRegistryValidationProfileRepository,
        ),
        provider.resolve<IValidationProfileCatalog>(
          InfrastructureTokens.AiValidationProfileRegistryValidationProfileCatalog,
        ),
        provider.resolve<IValidationProfileValidator>(
          InfrastructureTokens.AiValidationProfileRegistryValidationProfileValidator,
        ),
        provider.resolve<IValidationProfileSerializer>(
          InfrastructureTokens.AiValidationProfileRegistryValidationProfileSerializer,
        ),
        provider.resolve<IValidationProfileStatisticsProvider>(
          InfrastructureTokens.AiValidationProfileRegistryValidationProfileStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiValidationProfileRegistryRegisterValidationProfileUseCase,
    (provider) =>
      new RegisterValidationProfileUseCase(
        provider.resolve<AiValidationProfileRegistryService>(
          InfrastructureTokens.AiValidationProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiValidationProfileRegistryGetValidationProfileUseCase,
    (provider) =>
      new GetValidationProfileUseCase(
        provider.resolve<AiValidationProfileRegistryService>(
          InfrastructureTokens.AiValidationProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiValidationProfileRegistryListValidationProfilesUseCase,
    (provider) =>
      new ListValidationProfilesUseCase(
        provider.resolve<AiValidationProfileRegistryService>(
          InfrastructureTokens.AiValidationProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiValidationProfileRegistryUpdateValidationProfileUseCase,
    (provider) =>
      new UpdateValidationProfileUseCase(
        provider.resolve<AiValidationProfileRegistryService>(
          InfrastructureTokens.AiValidationProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiValidationProfileRegistryDeleteValidationProfileUseCase,
    (provider) =>
      new DeleteValidationProfileUseCase(
        provider.resolve<AiValidationProfileRegistryService>(
          InfrastructureTokens.AiValidationProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiValidationProfileRegistryFindValidationProfileByNameUseCase,
    (provider) =>
      new FindValidationProfileByNameUseCase(
        provider.resolve<AiValidationProfileRegistryService>(
          InfrastructureTokens.AiValidationProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiValidationProfileRegistryListValidationProfilesByCategoryUseCase,
    (provider) =>
      new ListValidationProfilesByCategoryUseCase(
        provider.resolve<AiValidationProfileRegistryService>(
          InfrastructureTokens.AiValidationProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiValidationProfileRegistryGetValidationProfileRegistryStatisticsUseCase,
    (provider) =>
      new GetValidationProfileRegistryStatisticsUseCase(
        provider.resolve<AiValidationProfileRegistryService>(
          InfrastructureTokens.AiValidationProfileRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiValidationProfileRegistryApplicationService,
    (provider) =>
      new AiValidationProfileRegistryApplicationService(
        provider.resolve<RegisterValidationProfileUseCase>(
          InfrastructureTokens.AiValidationProfileRegistryRegisterValidationProfileUseCase,
        ),
        provider.resolve<GetValidationProfileUseCase>(
          InfrastructureTokens.AiValidationProfileRegistryGetValidationProfileUseCase,
        ),
        provider.resolve<ListValidationProfilesUseCase>(
          InfrastructureTokens.AiValidationProfileRegistryListValidationProfilesUseCase,
        ),
        provider.resolve<UpdateValidationProfileUseCase>(
          InfrastructureTokens.AiValidationProfileRegistryUpdateValidationProfileUseCase,
        ),
        provider.resolve<DeleteValidationProfileUseCase>(
          InfrastructureTokens.AiValidationProfileRegistryDeleteValidationProfileUseCase,
        ),
        provider.resolve<FindValidationProfileByNameUseCase>(
          InfrastructureTokens.AiValidationProfileRegistryFindValidationProfileByNameUseCase,
        ),
        provider.resolve<ListValidationProfilesByCategoryUseCase>(
          InfrastructureTokens.AiValidationProfileRegistryListValidationProfilesByCategoryUseCase,
        ),
        provider.resolve<GetValidationProfileRegistryStatisticsUseCase>(
          InfrastructureTokens.AiValidationProfileRegistryGetValidationProfileRegistryStatisticsUseCase,
        ),
      ),
  );
}
