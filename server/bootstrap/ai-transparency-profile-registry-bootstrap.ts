import type { ITransparencyProfileCatalog } from "@server/application/ai-transparency-profile-registry/contracts/transparency-profile-catalog.contract";
import type { ITransparencyProfileRepository } from "@server/application/ai-transparency-profile-registry/contracts/transparency-profile-repository.contract";
import type { ITransparencyProfileSerializer } from "@server/application/ai-transparency-profile-registry/contracts/transparency-profile-serializer.contract";
import type { ITransparencyProfileStatisticsProvider } from "@server/application/ai-transparency-profile-registry/contracts/transparency-profile-statistics-provider.contract";
import type { ITransparencyProfileValidator } from "@server/application/ai-transparency-profile-registry/contracts/transparency-profile-validator.contract";
import {
  AiTransparencyProfileRegistryApplicationService,
  AiTransparencyProfileRegistryService,
  DeleteTransparencyProfileUseCase,
  FindTransparencyProfileByNameUseCase,
  GetTransparencyProfileRegistryStatisticsUseCase,
  GetTransparencyProfileUseCase,
  ListTransparencyProfilesByCategoryUseCase,
  ListTransparencyProfilesUseCase,
  RegisterTransparencyProfileUseCase,
  UpdateTransparencyProfileUseCase,
} from "@server/application/ai-transparency-profile-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { TransparencyProfileRepository } from "@server/infrastructure/ai-transparency-profile-registry/transparency-profile.repository";
import { DefaultTransparencyProfileCatalog } from "@server/infrastructure/ai-transparency-profile-registry/default-transparency-profile.catalog";
import { DefaultTransparencyProfileStatisticsProvider } from "@server/infrastructure/ai-transparency-profile-registry/default-transparency-profile-statistics.provider";
import { DefaultTransparencyProfileValidator } from "@server/infrastructure/ai-transparency-profile-registry/default-transparency-profile.validator";
import { JsonTransparencyProfileSerializer } from "@server/infrastructure/ai-transparency-profile-registry/json-transparency-profile.serializer";

/** Registers AI Transparency Profile Registry services and use cases. */
export function registerAiTransparencyProfileRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiTransparencyProfileRegistryTransparencyProfileRepository,
    () => new TransparencyProfileRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiTransparencyProfileRegistryTransparencyProfileCatalog,
    () => new DefaultTransparencyProfileCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiTransparencyProfileRegistryTransparencyProfileValidator,
    () => new DefaultTransparencyProfileValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiTransparencyProfileRegistryTransparencyProfileSerializer,
    () => new JsonTransparencyProfileSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiTransparencyProfileRegistryTransparencyProfileStatisticsProvider,
    () => new DefaultTransparencyProfileStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiTransparencyProfileRegistryService,
    (provider) =>
      new AiTransparencyProfileRegistryService(
        provider.resolve<ITransparencyProfileRepository>(
          InfrastructureTokens.AiTransparencyProfileRegistryTransparencyProfileRepository,
        ),
        provider.resolve<ITransparencyProfileCatalog>(
          InfrastructureTokens.AiTransparencyProfileRegistryTransparencyProfileCatalog,
        ),
        provider.resolve<ITransparencyProfileValidator>(
          InfrastructureTokens.AiTransparencyProfileRegistryTransparencyProfileValidator,
        ),
        provider.resolve<ITransparencyProfileSerializer>(
          InfrastructureTokens.AiTransparencyProfileRegistryTransparencyProfileSerializer,
        ),
        provider.resolve<ITransparencyProfileStatisticsProvider>(
          InfrastructureTokens.AiTransparencyProfileRegistryTransparencyProfileStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiTransparencyProfileRegistryRegisterTransparencyProfileUseCase,
    (provider) =>
      new RegisterTransparencyProfileUseCase(
        provider.resolve<AiTransparencyProfileRegistryService>(
          InfrastructureTokens.AiTransparencyProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiTransparencyProfileRegistryGetTransparencyProfileUseCase,
    (provider) =>
      new GetTransparencyProfileUseCase(
        provider.resolve<AiTransparencyProfileRegistryService>(
          InfrastructureTokens.AiTransparencyProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiTransparencyProfileRegistryListTransparencyProfilesUseCase,
    (provider) =>
      new ListTransparencyProfilesUseCase(
        provider.resolve<AiTransparencyProfileRegistryService>(
          InfrastructureTokens.AiTransparencyProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiTransparencyProfileRegistryUpdateTransparencyProfileUseCase,
    (provider) =>
      new UpdateTransparencyProfileUseCase(
        provider.resolve<AiTransparencyProfileRegistryService>(
          InfrastructureTokens.AiTransparencyProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiTransparencyProfileRegistryDeleteTransparencyProfileUseCase,
    (provider) =>
      new DeleteTransparencyProfileUseCase(
        provider.resolve<AiTransparencyProfileRegistryService>(
          InfrastructureTokens.AiTransparencyProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiTransparencyProfileRegistryFindTransparencyProfileByNameUseCase,
    (provider) =>
      new FindTransparencyProfileByNameUseCase(
        provider.resolve<AiTransparencyProfileRegistryService>(
          InfrastructureTokens.AiTransparencyProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiTransparencyProfileRegistryListTransparencyProfilesByCategoryUseCase,
    (provider) =>
      new ListTransparencyProfilesByCategoryUseCase(
        provider.resolve<AiTransparencyProfileRegistryService>(
          InfrastructureTokens.AiTransparencyProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiTransparencyProfileRegistryGetTransparencyProfileRegistryStatisticsUseCase,
    (provider) =>
      new GetTransparencyProfileRegistryStatisticsUseCase(
        provider.resolve<AiTransparencyProfileRegistryService>(
          InfrastructureTokens.AiTransparencyProfileRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiTransparencyProfileRegistryApplicationService,
    (provider) =>
      new AiTransparencyProfileRegistryApplicationService(
        provider.resolve<RegisterTransparencyProfileUseCase>(
          InfrastructureTokens.AiTransparencyProfileRegistryRegisterTransparencyProfileUseCase,
        ),
        provider.resolve<GetTransparencyProfileUseCase>(
          InfrastructureTokens.AiTransparencyProfileRegistryGetTransparencyProfileUseCase,
        ),
        provider.resolve<ListTransparencyProfilesUseCase>(
          InfrastructureTokens.AiTransparencyProfileRegistryListTransparencyProfilesUseCase,
        ),
        provider.resolve<UpdateTransparencyProfileUseCase>(
          InfrastructureTokens.AiTransparencyProfileRegistryUpdateTransparencyProfileUseCase,
        ),
        provider.resolve<DeleteTransparencyProfileUseCase>(
          InfrastructureTokens.AiTransparencyProfileRegistryDeleteTransparencyProfileUseCase,
        ),
        provider.resolve<FindTransparencyProfileByNameUseCase>(
          InfrastructureTokens.AiTransparencyProfileRegistryFindTransparencyProfileByNameUseCase,
        ),
        provider.resolve<ListTransparencyProfilesByCategoryUseCase>(
          InfrastructureTokens.AiTransparencyProfileRegistryListTransparencyProfilesByCategoryUseCase,
        ),
        provider.resolve<GetTransparencyProfileRegistryStatisticsUseCase>(
          InfrastructureTokens.AiTransparencyProfileRegistryGetTransparencyProfileRegistryStatisticsUseCase,
        ),
      ),
  );
}
