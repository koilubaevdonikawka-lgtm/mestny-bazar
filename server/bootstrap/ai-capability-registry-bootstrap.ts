import type { ICapabilityCatalog } from "@server/application/ai-capability-registry/contracts/capability-catalog.contract";
import type { ICapabilityRepository } from "@server/application/ai-capability-registry/contracts/capability-repository.contract";
import type { ICapabilitySerializer } from "@server/application/ai-capability-registry/contracts/capability-serializer.contract";
import type { ICapabilityStatisticsProvider } from "@server/application/ai-capability-registry/contracts/capability-statistics-provider.contract";
import type { ICapabilityValidator } from "@server/application/ai-capability-registry/contracts/capability-validator.contract";
import {
  AiCapabilityRegistryApplicationService,
  AiCapabilityRegistryService,
  DeleteCapabilityUseCase,
  FindCapabilityByNameUseCase,
  GetCapabilityRegistryStatisticsUseCase,
  GetCapabilityUseCase,
  ListCapabilitiesByCategoryUseCase,
  ListCapabilitiesUseCase,
  RegisterCapabilityUseCase,
  UpdateCapabilityUseCase,
} from "@server/application/ai-capability-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { CapabilityRepository } from "@server/infrastructure/ai-capability-registry/capability.repository";
import { DefaultCapabilityCatalog } from "@server/infrastructure/ai-capability-registry/default-capability.catalog";
import { DefaultCapabilityStatisticsProvider } from "@server/infrastructure/ai-capability-registry/default-capability-statistics.provider";
import { DefaultCapabilityValidator } from "@server/infrastructure/ai-capability-registry/default-capability.validator";
import { JsonCapabilitySerializer } from "@server/infrastructure/ai-capability-registry/json-capability.serializer";

/** Registers AI Capability Registry services and use cases. */
export function registerAiCapabilityRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiCapabilityRegistryCapabilityRepository,
    () => new CapabilityRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiCapabilityRegistryCapabilityCatalog,
    () => new DefaultCapabilityCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiCapabilityRegistryCapabilityValidator,
    () => new DefaultCapabilityValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiCapabilityRegistryCapabilitySerializer,
    () => new JsonCapabilitySerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiCapabilityRegistryCapabilityStatisticsProvider,
    () => new DefaultCapabilityStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiCapabilityRegistryService,
    (provider) =>
      new AiCapabilityRegistryService(
        provider.resolve<ICapabilityRepository>(
          InfrastructureTokens.AiCapabilityRegistryCapabilityRepository,
        ),
        provider.resolve<ICapabilityCatalog>(
          InfrastructureTokens.AiCapabilityRegistryCapabilityCatalog,
        ),
        provider.resolve<ICapabilityValidator>(
          InfrastructureTokens.AiCapabilityRegistryCapabilityValidator,
        ),
        provider.resolve<ICapabilitySerializer>(
          InfrastructureTokens.AiCapabilityRegistryCapabilitySerializer,
        ),
        provider.resolve<ICapabilityStatisticsProvider>(
          InfrastructureTokens.AiCapabilityRegistryCapabilityStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiCapabilityRegistryRegisterCapabilityUseCase,
    (provider) =>
      new RegisterCapabilityUseCase(
        provider.resolve<AiCapabilityRegistryService>(
          InfrastructureTokens.AiCapabilityRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiCapabilityRegistryGetCapabilityUseCase,
    (provider) =>
      new GetCapabilityUseCase(
        provider.resolve<AiCapabilityRegistryService>(
          InfrastructureTokens.AiCapabilityRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiCapabilityRegistryListCapabilitiesUseCase,
    (provider) =>
      new ListCapabilitiesUseCase(
        provider.resolve<AiCapabilityRegistryService>(
          InfrastructureTokens.AiCapabilityRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiCapabilityRegistryUpdateCapabilityUseCase,
    (provider) =>
      new UpdateCapabilityUseCase(
        provider.resolve<AiCapabilityRegistryService>(
          InfrastructureTokens.AiCapabilityRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiCapabilityRegistryDeleteCapabilityUseCase,
    (provider) =>
      new DeleteCapabilityUseCase(
        provider.resolve<AiCapabilityRegistryService>(
          InfrastructureTokens.AiCapabilityRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiCapabilityRegistryFindCapabilityByNameUseCase,
    (provider) =>
      new FindCapabilityByNameUseCase(
        provider.resolve<AiCapabilityRegistryService>(
          InfrastructureTokens.AiCapabilityRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiCapabilityRegistryListCapabilitiesByCategoryUseCase,
    (provider) =>
      new ListCapabilitiesByCategoryUseCase(
        provider.resolve<AiCapabilityRegistryService>(
          InfrastructureTokens.AiCapabilityRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiCapabilityRegistryGetCapabilityRegistryStatisticsUseCase,
    (provider) =>
      new GetCapabilityRegistryStatisticsUseCase(
        provider.resolve<AiCapabilityRegistryService>(
          InfrastructureTokens.AiCapabilityRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiCapabilityRegistryApplicationService,
    (provider) =>
      new AiCapabilityRegistryApplicationService(
        provider.resolve<RegisterCapabilityUseCase>(
          InfrastructureTokens.AiCapabilityRegistryRegisterCapabilityUseCase,
        ),
        provider.resolve<GetCapabilityUseCase>(
          InfrastructureTokens.AiCapabilityRegistryGetCapabilityUseCase,
        ),
        provider.resolve<ListCapabilitiesUseCase>(
          InfrastructureTokens.AiCapabilityRegistryListCapabilitiesUseCase,
        ),
        provider.resolve<UpdateCapabilityUseCase>(
          InfrastructureTokens.AiCapabilityRegistryUpdateCapabilityUseCase,
        ),
        provider.resolve<DeleteCapabilityUseCase>(
          InfrastructureTokens.AiCapabilityRegistryDeleteCapabilityUseCase,
        ),
        provider.resolve<FindCapabilityByNameUseCase>(
          InfrastructureTokens.AiCapabilityRegistryFindCapabilityByNameUseCase,
        ),
        provider.resolve<ListCapabilitiesByCategoryUseCase>(
          InfrastructureTokens.AiCapabilityRegistryListCapabilitiesByCategoryUseCase,
        ),
        provider.resolve<GetCapabilityRegistryStatisticsUseCase>(
          InfrastructureTokens.AiCapabilityRegistryGetCapabilityRegistryStatisticsUseCase,
        ),
      ),
  );
}
