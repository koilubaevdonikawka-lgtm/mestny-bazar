import type { IVocabularyCatalog } from "@server/application/ai-vocabulary-registry/contracts/vocabulary-catalog.contract";
import type { IVocabularyRepository } from "@server/application/ai-vocabulary-registry/contracts/vocabulary-repository.contract";
import type { IVocabularySerializer } from "@server/application/ai-vocabulary-registry/contracts/vocabulary-serializer.contract";
import type { IVocabularyStatisticsProvider } from "@server/application/ai-vocabulary-registry/contracts/vocabulary-statistics-provider.contract";
import type { IVocabularyValidator } from "@server/application/ai-vocabulary-registry/contracts/vocabulary-validator.contract";
import {
  AiVocabularyRegistryApplicationService,
  AiVocabularyRegistryService,
  DeleteVocabularyUseCase,
  FindVocabularyByNameUseCase,
  GetVocabularyRegistryStatisticsUseCase,
  GetVocabularyUseCase,
  ListVocabulariesByCategoryUseCase,
  ListVocabulariesUseCase,
  RegisterVocabularyUseCase,
  UpdateVocabularyUseCase,
} from "@server/application/ai-vocabulary-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { VocabularyRepository } from "@server/infrastructure/ai-vocabulary-registry/vocabulary.repository";
import { DefaultVocabularyCatalog } from "@server/infrastructure/ai-vocabulary-registry/default-vocabulary.catalog";
import { DefaultVocabularyStatisticsProvider } from "@server/infrastructure/ai-vocabulary-registry/default-vocabulary-statistics.provider";
import { DefaultVocabularyValidator } from "@server/infrastructure/ai-vocabulary-registry/default-vocabulary.validator";
import { JsonVocabularySerializer } from "@server/infrastructure/ai-vocabulary-registry/json-vocabulary.serializer";

/** Registers AI Vocabulary Registry services and use cases. */
export function registerAiVocabularyRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiVocabularyRegistryVocabularyRepository,
    () => new VocabularyRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiVocabularyRegistryVocabularyCatalog,
    () => new DefaultVocabularyCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiVocabularyRegistryVocabularyValidator,
    () => new DefaultVocabularyValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiVocabularyRegistryVocabularySerializer,
    () => new JsonVocabularySerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiVocabularyRegistryVocabularyStatisticsProvider,
    () => new DefaultVocabularyStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiVocabularyRegistryService,
    (provider) =>
      new AiVocabularyRegistryService(
        provider.resolve<IVocabularyRepository>(
          InfrastructureTokens.AiVocabularyRegistryVocabularyRepository,
        ),
        provider.resolve<IVocabularyCatalog>(
          InfrastructureTokens.AiVocabularyRegistryVocabularyCatalog,
        ),
        provider.resolve<IVocabularyValidator>(
          InfrastructureTokens.AiVocabularyRegistryVocabularyValidator,
        ),
        provider.resolve<IVocabularySerializer>(
          InfrastructureTokens.AiVocabularyRegistryVocabularySerializer,
        ),
        provider.resolve<IVocabularyStatisticsProvider>(
          InfrastructureTokens.AiVocabularyRegistryVocabularyStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiVocabularyRegistryRegisterVocabularyUseCase,
    (provider) =>
      new RegisterVocabularyUseCase(
        provider.resolve<AiVocabularyRegistryService>(
          InfrastructureTokens.AiVocabularyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiVocabularyRegistryGetVocabularyUseCase,
    (provider) =>
      new GetVocabularyUseCase(
        provider.resolve<AiVocabularyRegistryService>(
          InfrastructureTokens.AiVocabularyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiVocabularyRegistryListVocabulariesUseCase,
    (provider) =>
      new ListVocabulariesUseCase(
        provider.resolve<AiVocabularyRegistryService>(
          InfrastructureTokens.AiVocabularyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiVocabularyRegistryUpdateVocabularyUseCase,
    (provider) =>
      new UpdateVocabularyUseCase(
        provider.resolve<AiVocabularyRegistryService>(
          InfrastructureTokens.AiVocabularyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiVocabularyRegistryDeleteVocabularyUseCase,
    (provider) =>
      new DeleteVocabularyUseCase(
        provider.resolve<AiVocabularyRegistryService>(
          InfrastructureTokens.AiVocabularyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiVocabularyRegistryFindVocabularyByNameUseCase,
    (provider) =>
      new FindVocabularyByNameUseCase(
        provider.resolve<AiVocabularyRegistryService>(
          InfrastructureTokens.AiVocabularyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiVocabularyRegistryListVocabulariesByCategoryUseCase,
    (provider) =>
      new ListVocabulariesByCategoryUseCase(
        provider.resolve<AiVocabularyRegistryService>(
          InfrastructureTokens.AiVocabularyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiVocabularyRegistryGetVocabularyRegistryStatisticsUseCase,
    (provider) =>
      new GetVocabularyRegistryStatisticsUseCase(
        provider.resolve<AiVocabularyRegistryService>(
          InfrastructureTokens.AiVocabularyRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiVocabularyRegistryApplicationService,
    (provider) =>
      new AiVocabularyRegistryApplicationService(
        provider.resolve<RegisterVocabularyUseCase>(
          InfrastructureTokens.AiVocabularyRegistryRegisterVocabularyUseCase,
        ),
        provider.resolve<GetVocabularyUseCase>(
          InfrastructureTokens.AiVocabularyRegistryGetVocabularyUseCase,
        ),
        provider.resolve<ListVocabulariesUseCase>(
          InfrastructureTokens.AiVocabularyRegistryListVocabulariesUseCase,
        ),
        provider.resolve<UpdateVocabularyUseCase>(
          InfrastructureTokens.AiVocabularyRegistryUpdateVocabularyUseCase,
        ),
        provider.resolve<DeleteVocabularyUseCase>(
          InfrastructureTokens.AiVocabularyRegistryDeleteVocabularyUseCase,
        ),
        provider.resolve<FindVocabularyByNameUseCase>(
          InfrastructureTokens.AiVocabularyRegistryFindVocabularyByNameUseCase,
        ),
        provider.resolve<ListVocabulariesByCategoryUseCase>(
          InfrastructureTokens.AiVocabularyRegistryListVocabulariesByCategoryUseCase,
        ),
        provider.resolve<GetVocabularyRegistryStatisticsUseCase>(
          InfrastructureTokens.AiVocabularyRegistryGetVocabularyRegistryStatisticsUseCase,
        ),
      ),
  );
}
