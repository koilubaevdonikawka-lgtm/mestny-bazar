import type { ICapabilityCatalog } from "@server/application/ai-capability-discovery/contracts/capability-catalog.contract";
import type { ICapabilityRepository } from "@server/application/ai-capability-discovery/contracts/capability-repository.contract";
import type { ICapabilitySerializer } from "@server/application/ai-capability-discovery/contracts/capability-serializer.contract";
import type { ICapabilityStatisticsProvider } from "@server/application/ai-capability-discovery/contracts/capability-statistics-provider.contract";
import type { ICapabilityValidator } from "@server/application/ai-capability-discovery/contracts/capability-validator.contract";
import {
  AiCapabilityDiscoveryApplicationService,
  AiCapabilityDiscoveryService,
  DeleteCapabilityUseCase,
  FindCapabilityByNameUseCase,
  GetCapabilityStatisticsUseCase,
  GetCapabilityUseCase,
  ListCapabilitiesByCategoryUseCase,
  ListCapabilitiesUseCase,
  RegisterCapabilityUseCase,
  UpdateCapabilityUseCase,
} from "@server/application/ai-capability-discovery";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { CapabilityRepository } from "@server/infrastructure/ai-capability-discovery/capability.repository";
import { DefaultCapabilityCatalog } from "@server/infrastructure/ai-capability-discovery/default-capability.catalog";
import { DefaultCapabilityStatisticsProvider } from "@server/infrastructure/ai-capability-discovery/default-capability-statistics.provider";
import { DefaultCapabilityValidator } from "@server/infrastructure/ai-capability-discovery/default-capability.validator";
import { JsonCapabilitySerializer } from "@server/infrastructure/ai-capability-discovery/json-capability.serializer";

/** Registers AI Capability Discovery services and use cases. */
export function registerAiCapabilityDiscoveryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiCapabilityDiscoveryCapabilityRepository,
    () => new CapabilityRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiCapabilityDiscoveryCapabilityCatalog,
    (provider) =>
      new DefaultCapabilityCatalog(
        provider.resolve<ICapabilityRepository>(
          InfrastructureTokens.AiCapabilityDiscoveryCapabilityRepository,
        ),
      ),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiCapabilityDiscoveryCapabilityValidator,
    () => new DefaultCapabilityValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiCapabilityDiscoveryCapabilitySerializer,
    () => new JsonCapabilitySerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiCapabilityDiscoveryCapabilityStatisticsProvider,
    () => new DefaultCapabilityStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiCapabilityDiscoveryService,
    (provider) =>
      new AiCapabilityDiscoveryService(
        provider.resolve<ICapabilityRepository>(
          InfrastructureTokens.AiCapabilityDiscoveryCapabilityRepository,
        ),
        provider.resolve<ICapabilityCatalog>(
          InfrastructureTokens.AiCapabilityDiscoveryCapabilityCatalog,
        ),
        provider.resolve<ICapabilityValidator>(
          InfrastructureTokens.AiCapabilityDiscoveryCapabilityValidator,
        ),
        provider.resolve<ICapabilitySerializer>(
          InfrastructureTokens.AiCapabilityDiscoveryCapabilitySerializer,
        ),
        provider.resolve<ICapabilityStatisticsProvider>(
          InfrastructureTokens.AiCapabilityDiscoveryCapabilityStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiCapabilityDiscoveryRegisterCapabilityUseCase,
    (provider) =>
      new RegisterCapabilityUseCase(
        provider.resolve<AiCapabilityDiscoveryService>(
          InfrastructureTokens.AiCapabilityDiscoveryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiCapabilityDiscoveryGetCapabilityUseCase,
    (provider) =>
      new GetCapabilityUseCase(
        provider.resolve<AiCapabilityDiscoveryService>(
          InfrastructureTokens.AiCapabilityDiscoveryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiCapabilityDiscoveryListCapabilitiesUseCase,
    (provider) =>
      new ListCapabilitiesUseCase(
        provider.resolve<AiCapabilityDiscoveryService>(
          InfrastructureTokens.AiCapabilityDiscoveryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiCapabilityDiscoveryUpdateCapabilityUseCase,
    (provider) =>
      new UpdateCapabilityUseCase(
        provider.resolve<AiCapabilityDiscoveryService>(
          InfrastructureTokens.AiCapabilityDiscoveryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiCapabilityDiscoveryDeleteCapabilityUseCase,
    (provider) =>
      new DeleteCapabilityUseCase(
        provider.resolve<AiCapabilityDiscoveryService>(
          InfrastructureTokens.AiCapabilityDiscoveryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiCapabilityDiscoveryFindCapabilityByNameUseCase,
    (provider) =>
      new FindCapabilityByNameUseCase(
        provider.resolve<AiCapabilityDiscoveryService>(
          InfrastructureTokens.AiCapabilityDiscoveryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiCapabilityDiscoveryListCapabilitiesByCategoryUseCase,
    (provider) =>
      new ListCapabilitiesByCategoryUseCase(
        provider.resolve<AiCapabilityDiscoveryService>(
          InfrastructureTokens.AiCapabilityDiscoveryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiCapabilityDiscoveryGetCapabilityStatisticsUseCase,
    (provider) =>
      new GetCapabilityStatisticsUseCase(
        provider.resolve<AiCapabilityDiscoveryService>(
          InfrastructureTokens.AiCapabilityDiscoveryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiCapabilityDiscoveryApplicationService,
    (provider) =>
      new AiCapabilityDiscoveryApplicationService(
        provider.resolve<RegisterCapabilityUseCase>(
          InfrastructureTokens.AiCapabilityDiscoveryRegisterCapabilityUseCase,
        ),
        provider.resolve<GetCapabilityUseCase>(
          InfrastructureTokens.AiCapabilityDiscoveryGetCapabilityUseCase,
        ),
        provider.resolve<ListCapabilitiesUseCase>(
          InfrastructureTokens.AiCapabilityDiscoveryListCapabilitiesUseCase,
        ),
        provider.resolve<UpdateCapabilityUseCase>(
          InfrastructureTokens.AiCapabilityDiscoveryUpdateCapabilityUseCase,
        ),
        provider.resolve<DeleteCapabilityUseCase>(
          InfrastructureTokens.AiCapabilityDiscoveryDeleteCapabilityUseCase,
        ),
        provider.resolve<FindCapabilityByNameUseCase>(
          InfrastructureTokens.AiCapabilityDiscoveryFindCapabilityByNameUseCase,
        ),
        provider.resolve<ListCapabilitiesByCategoryUseCase>(
          InfrastructureTokens.AiCapabilityDiscoveryListCapabilitiesByCategoryUseCase,
        ),
        provider.resolve<GetCapabilityStatisticsUseCase>(
          InfrastructureTokens.AiCapabilityDiscoveryGetCapabilityStatisticsUseCase,
        ),
      ),
  );
}
