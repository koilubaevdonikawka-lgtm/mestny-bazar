import type { IKnowledgePackageCatalog } from "@server/application/ai-knowledge-package-registry/contracts/knowledge-package-catalog.contract";
import type { IKnowledgePackageRepository } from "@server/application/ai-knowledge-package-registry/contracts/knowledge-package-repository.contract";
import type { IKnowledgePackageSerializer } from "@server/application/ai-knowledge-package-registry/contracts/knowledge-package-serializer.contract";
import type { IKnowledgePackageStatisticsProvider } from "@server/application/ai-knowledge-package-registry/contracts/knowledge-package-statistics-provider.contract";
import type { IKnowledgePackageValidator } from "@server/application/ai-knowledge-package-registry/contracts/knowledge-package-validator.contract";
import {
  AiKnowledgePackageRegistryApplicationService,
  AiKnowledgePackageRegistryService,
  DeleteKnowledgePackageUseCase,
  FindKnowledgePackageByNameUseCase,
  GetKnowledgePackageRegistryStatisticsUseCase,
  GetKnowledgePackageUseCase,
  ListKnowledgePackagesByCategoryUseCase,
  ListKnowledgePackagesUseCase,
  RegisterKnowledgePackageUseCase,
  UpdateKnowledgePackageUseCase,
} from "@server/application/ai-knowledge-package-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { KnowledgePackageRepository } from "@server/infrastructure/ai-knowledge-package-registry/knowledge-package.repository";
import { DefaultKnowledgePackageCatalog } from "@server/infrastructure/ai-knowledge-package-registry/default-knowledge-package.catalog";
import { DefaultKnowledgePackageStatisticsProvider } from "@server/infrastructure/ai-knowledge-package-registry/default-knowledge-package-statistics.provider";
import { DefaultKnowledgePackageValidator } from "@server/infrastructure/ai-knowledge-package-registry/default-knowledge-package.validator";
import { JsonKnowledgePackageSerializer } from "@server/infrastructure/ai-knowledge-package-registry/json-knowledge-package.serializer";

/** Registers AI Knowledge Package Registry services and use cases. */
export function registerAiKnowledgePackageRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiKnowledgePackageRegistryKnowledgePackageRepository,
    () => new KnowledgePackageRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiKnowledgePackageRegistryKnowledgePackageCatalog,
    () => new DefaultKnowledgePackageCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiKnowledgePackageRegistryKnowledgePackageValidator,
    () => new DefaultKnowledgePackageValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiKnowledgePackageRegistryKnowledgePackageSerializer,
    () => new JsonKnowledgePackageSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiKnowledgePackageRegistryKnowledgePackageStatisticsProvider,
    () => new DefaultKnowledgePackageStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiKnowledgePackageRegistryService,
    (provider) =>
      new AiKnowledgePackageRegistryService(
        provider.resolve<IKnowledgePackageRepository>(
          InfrastructureTokens.AiKnowledgePackageRegistryKnowledgePackageRepository,
        ),
        provider.resolve<IKnowledgePackageCatalog>(
          InfrastructureTokens.AiKnowledgePackageRegistryKnowledgePackageCatalog,
        ),
        provider.resolve<IKnowledgePackageValidator>(
          InfrastructureTokens.AiKnowledgePackageRegistryKnowledgePackageValidator,
        ),
        provider.resolve<IKnowledgePackageSerializer>(
          InfrastructureTokens.AiKnowledgePackageRegistryKnowledgePackageSerializer,
        ),
        provider.resolve<IKnowledgePackageStatisticsProvider>(
          InfrastructureTokens.AiKnowledgePackageRegistryKnowledgePackageStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiKnowledgePackageRegistryRegisterKnowledgePackageUseCase,
    (provider) =>
      new RegisterKnowledgePackageUseCase(
        provider.resolve<AiKnowledgePackageRegistryService>(
          InfrastructureTokens.AiKnowledgePackageRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiKnowledgePackageRegistryGetKnowledgePackageUseCase,
    (provider) =>
      new GetKnowledgePackageUseCase(
        provider.resolve<AiKnowledgePackageRegistryService>(
          InfrastructureTokens.AiKnowledgePackageRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiKnowledgePackageRegistryListKnowledgePackagesUseCase,
    (provider) =>
      new ListKnowledgePackagesUseCase(
        provider.resolve<AiKnowledgePackageRegistryService>(
          InfrastructureTokens.AiKnowledgePackageRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiKnowledgePackageRegistryUpdateKnowledgePackageUseCase,
    (provider) =>
      new UpdateKnowledgePackageUseCase(
        provider.resolve<AiKnowledgePackageRegistryService>(
          InfrastructureTokens.AiKnowledgePackageRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiKnowledgePackageRegistryDeleteKnowledgePackageUseCase,
    (provider) =>
      new DeleteKnowledgePackageUseCase(
        provider.resolve<AiKnowledgePackageRegistryService>(
          InfrastructureTokens.AiKnowledgePackageRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiKnowledgePackageRegistryFindKnowledgePackageByNameUseCase,
    (provider) =>
      new FindKnowledgePackageByNameUseCase(
        provider.resolve<AiKnowledgePackageRegistryService>(
          InfrastructureTokens.AiKnowledgePackageRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiKnowledgePackageRegistryListKnowledgePackagesByCategoryUseCase,
    (provider) =>
      new ListKnowledgePackagesByCategoryUseCase(
        provider.resolve<AiKnowledgePackageRegistryService>(
          InfrastructureTokens.AiKnowledgePackageRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiKnowledgePackageRegistryGetKnowledgePackageRegistryStatisticsUseCase,
    (provider) =>
      new GetKnowledgePackageRegistryStatisticsUseCase(
        provider.resolve<AiKnowledgePackageRegistryService>(
          InfrastructureTokens.AiKnowledgePackageRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiKnowledgePackageRegistryApplicationService,
    (provider) =>
      new AiKnowledgePackageRegistryApplicationService(
        provider.resolve<RegisterKnowledgePackageUseCase>(
          InfrastructureTokens.AiKnowledgePackageRegistryRegisterKnowledgePackageUseCase,
        ),
        provider.resolve<GetKnowledgePackageUseCase>(
          InfrastructureTokens.AiKnowledgePackageRegistryGetKnowledgePackageUseCase,
        ),
        provider.resolve<ListKnowledgePackagesUseCase>(
          InfrastructureTokens.AiKnowledgePackageRegistryListKnowledgePackagesUseCase,
        ),
        provider.resolve<UpdateKnowledgePackageUseCase>(
          InfrastructureTokens.AiKnowledgePackageRegistryUpdateKnowledgePackageUseCase,
        ),
        provider.resolve<DeleteKnowledgePackageUseCase>(
          InfrastructureTokens.AiKnowledgePackageRegistryDeleteKnowledgePackageUseCase,
        ),
        provider.resolve<FindKnowledgePackageByNameUseCase>(
          InfrastructureTokens.AiKnowledgePackageRegistryFindKnowledgePackageByNameUseCase,
        ),
        provider.resolve<ListKnowledgePackagesByCategoryUseCase>(
          InfrastructureTokens.AiKnowledgePackageRegistryListKnowledgePackagesByCategoryUseCase,
        ),
        provider.resolve<GetKnowledgePackageRegistryStatisticsUseCase>(
          InfrastructureTokens.AiKnowledgePackageRegistryGetKnowledgePackageRegistryStatisticsUseCase,
        ),
      ),
  );
}
