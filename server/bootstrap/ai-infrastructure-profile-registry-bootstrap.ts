import type { IInfrastructureProfileCatalog } from "@server/application/ai-infrastructure-profile-registry/contracts/infrastructure-profile-catalog.contract";
import type { IInfrastructureProfileRepository } from "@server/application/ai-infrastructure-profile-registry/contracts/infrastructure-profile-repository.contract";
import type { IInfrastructureProfileSerializer } from "@server/application/ai-infrastructure-profile-registry/contracts/infrastructure-profile-serializer.contract";
import type { IInfrastructureProfileStatisticsProvider } from "@server/application/ai-infrastructure-profile-registry/contracts/infrastructure-profile-statistics-provider.contract";
import type { IInfrastructureProfileValidator } from "@server/application/ai-infrastructure-profile-registry/contracts/infrastructure-profile-validator.contract";
import {
  AiInfrastructureProfileRegistryApplicationService,
  AiInfrastructureProfileRegistryService,
  DeleteInfrastructureProfileUseCase,
  FindInfrastructureProfileByNameUseCase,
  GetInfrastructureProfileRegistryStatisticsUseCase,
  GetInfrastructureProfileUseCase,
  ListInfrastructureProfilesByCategoryUseCase,
  ListInfrastructureProfilesUseCase,
  RegisterInfrastructureProfileUseCase,
  UpdateInfrastructureProfileUseCase,
} from "@server/application/ai-infrastructure-profile-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { InfrastructureProfileRepository } from "@server/infrastructure/ai-infrastructure-profile-registry/infrastructure-profile.repository";
import { DefaultInfrastructureProfileCatalog } from "@server/infrastructure/ai-infrastructure-profile-registry/default-infrastructure-profile.catalog";
import { DefaultInfrastructureProfileStatisticsProvider } from "@server/infrastructure/ai-infrastructure-profile-registry/default-infrastructure-profile-statistics.provider";
import { DefaultInfrastructureProfileValidator } from "@server/infrastructure/ai-infrastructure-profile-registry/default-infrastructure-profile.validator";
import { JsonInfrastructureProfileSerializer } from "@server/infrastructure/ai-infrastructure-profile-registry/json-infrastructure-profile.serializer";

/** Registers AI Infrastructure Profile Registry services and use cases. */
export function registerAiInfrastructureProfileRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiInfrastructureProfileRegistryInfrastructureProfileRepository,
    () => new InfrastructureProfileRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiInfrastructureProfileRegistryInfrastructureProfileCatalog,
    () => new DefaultInfrastructureProfileCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiInfrastructureProfileRegistryInfrastructureProfileValidator,
    () => new DefaultInfrastructureProfileValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiInfrastructureProfileRegistryInfrastructureProfileSerializer,
    () => new JsonInfrastructureProfileSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiInfrastructureProfileRegistryInfrastructureProfileStatisticsProvider,
    () => new DefaultInfrastructureProfileStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiInfrastructureProfileRegistryService,
    (provider) =>
      new AiInfrastructureProfileRegistryService(
        provider.resolve<IInfrastructureProfileRepository>(
          InfrastructureTokens.AiInfrastructureProfileRegistryInfrastructureProfileRepository,
        ),
        provider.resolve<IInfrastructureProfileCatalog>(
          InfrastructureTokens.AiInfrastructureProfileRegistryInfrastructureProfileCatalog,
        ),
        provider.resolve<IInfrastructureProfileValidator>(
          InfrastructureTokens.AiInfrastructureProfileRegistryInfrastructureProfileValidator,
        ),
        provider.resolve<IInfrastructureProfileSerializer>(
          InfrastructureTokens.AiInfrastructureProfileRegistryInfrastructureProfileSerializer,
        ),
        provider.resolve<IInfrastructureProfileStatisticsProvider>(
          InfrastructureTokens.AiInfrastructureProfileRegistryInfrastructureProfileStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiInfrastructureProfileRegistryRegisterInfrastructureProfileUseCase,
    (provider) =>
      new RegisterInfrastructureProfileUseCase(
        provider.resolve<AiInfrastructureProfileRegistryService>(
          InfrastructureTokens.AiInfrastructureProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiInfrastructureProfileRegistryGetInfrastructureProfileUseCase,
    (provider) =>
      new GetInfrastructureProfileUseCase(
        provider.resolve<AiInfrastructureProfileRegistryService>(
          InfrastructureTokens.AiInfrastructureProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiInfrastructureProfileRegistryListInfrastructureProfilesUseCase,
    (provider) =>
      new ListInfrastructureProfilesUseCase(
        provider.resolve<AiInfrastructureProfileRegistryService>(
          InfrastructureTokens.AiInfrastructureProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiInfrastructureProfileRegistryUpdateInfrastructureProfileUseCase,
    (provider) =>
      new UpdateInfrastructureProfileUseCase(
        provider.resolve<AiInfrastructureProfileRegistryService>(
          InfrastructureTokens.AiInfrastructureProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiInfrastructureProfileRegistryDeleteInfrastructureProfileUseCase,
    (provider) =>
      new DeleteInfrastructureProfileUseCase(
        provider.resolve<AiInfrastructureProfileRegistryService>(
          InfrastructureTokens.AiInfrastructureProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiInfrastructureProfileRegistryFindInfrastructureProfileByNameUseCase,
    (provider) =>
      new FindInfrastructureProfileByNameUseCase(
        provider.resolve<AiInfrastructureProfileRegistryService>(
          InfrastructureTokens.AiInfrastructureProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiInfrastructureProfileRegistryListInfrastructureProfilesByCategoryUseCase,
    (provider) =>
      new ListInfrastructureProfilesByCategoryUseCase(
        provider.resolve<AiInfrastructureProfileRegistryService>(
          InfrastructureTokens.AiInfrastructureProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiInfrastructureProfileRegistryGetInfrastructureProfileRegistryStatisticsUseCase,
    (provider) =>
      new GetInfrastructureProfileRegistryStatisticsUseCase(
        provider.resolve<AiInfrastructureProfileRegistryService>(
          InfrastructureTokens.AiInfrastructureProfileRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiInfrastructureProfileRegistryApplicationService,
    (provider) =>
      new AiInfrastructureProfileRegistryApplicationService(
        provider.resolve<RegisterInfrastructureProfileUseCase>(
          InfrastructureTokens.AiInfrastructureProfileRegistryRegisterInfrastructureProfileUseCase,
        ),
        provider.resolve<GetInfrastructureProfileUseCase>(
          InfrastructureTokens.AiInfrastructureProfileRegistryGetInfrastructureProfileUseCase,
        ),
        provider.resolve<ListInfrastructureProfilesUseCase>(
          InfrastructureTokens.AiInfrastructureProfileRegistryListInfrastructureProfilesUseCase,
        ),
        provider.resolve<UpdateInfrastructureProfileUseCase>(
          InfrastructureTokens.AiInfrastructureProfileRegistryUpdateInfrastructureProfileUseCase,
        ),
        provider.resolve<DeleteInfrastructureProfileUseCase>(
          InfrastructureTokens.AiInfrastructureProfileRegistryDeleteInfrastructureProfileUseCase,
        ),
        provider.resolve<FindInfrastructureProfileByNameUseCase>(
          InfrastructureTokens.AiInfrastructureProfileRegistryFindInfrastructureProfileByNameUseCase,
        ),
        provider.resolve<ListInfrastructureProfilesByCategoryUseCase>(
          InfrastructureTokens.AiInfrastructureProfileRegistryListInfrastructureProfilesByCategoryUseCase,
        ),
        provider.resolve<GetInfrastructureProfileRegistryStatisticsUseCase>(
          InfrastructureTokens.AiInfrastructureProfileRegistryGetInfrastructureProfileRegistryStatisticsUseCase,
        ),
      ),
  );
}
