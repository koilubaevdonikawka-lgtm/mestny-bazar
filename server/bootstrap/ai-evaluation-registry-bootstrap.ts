import type { IEvaluationCatalog } from "@server/application/ai-evaluation-registry/contracts/evaluation-catalog.contract";
import type { IEvaluationRepository } from "@server/application/ai-evaluation-registry/contracts/evaluation-repository.contract";
import type { IEvaluationSerializer } from "@server/application/ai-evaluation-registry/contracts/evaluation-serializer.contract";
import type { IEvaluationStatisticsProvider } from "@server/application/ai-evaluation-registry/contracts/evaluation-statistics-provider.contract";
import type { IEvaluationValidator } from "@server/application/ai-evaluation-registry/contracts/evaluation-validator.contract";
import {
  AiEvaluationRegistryApplicationService,
  AiEvaluationRegistryService,
  DeleteEvaluationUseCase,
  FindEvaluationByNameUseCase,
  GetEvaluationRegistryStatisticsUseCase,
  GetEvaluationUseCase,
  ListEvaluationsByCategoryUseCase,
  ListEvaluationsUseCase,
  RegisterEvaluationUseCase,
  UpdateEvaluationUseCase,
} from "@server/application/ai-evaluation-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { EvaluationRepository } from "@server/infrastructure/ai-evaluation-registry/evaluation.repository";
import { DefaultEvaluationCatalog } from "@server/infrastructure/ai-evaluation-registry/default-evaluation.catalog";
import { DefaultEvaluationStatisticsProvider } from "@server/infrastructure/ai-evaluation-registry/default-evaluation-statistics.provider";
import { DefaultEvaluationValidator } from "@server/infrastructure/ai-evaluation-registry/default-evaluation.validator";
import { JsonEvaluationSerializer } from "@server/infrastructure/ai-evaluation-registry/json-evaluation.serializer";

/** Registers AI Evaluation Registry services and use cases. */
export function registerAiEvaluationRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiEvaluationRegistryEvaluationRepository,
    () => new EvaluationRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiEvaluationRegistryEvaluationCatalog,
    () => new DefaultEvaluationCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiEvaluationRegistryEvaluationValidator,
    () => new DefaultEvaluationValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiEvaluationRegistryEvaluationSerializer,
    () => new JsonEvaluationSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiEvaluationRegistryEvaluationStatisticsProvider,
    () => new DefaultEvaluationStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiEvaluationRegistryService,
    (provider) =>
      new AiEvaluationRegistryService(
        provider.resolve<IEvaluationRepository>(
          InfrastructureTokens.AiEvaluationRegistryEvaluationRepository,
        ),
        provider.resolve<IEvaluationCatalog>(
          InfrastructureTokens.AiEvaluationRegistryEvaluationCatalog,
        ),
        provider.resolve<IEvaluationValidator>(
          InfrastructureTokens.AiEvaluationRegistryEvaluationValidator,
        ),
        provider.resolve<IEvaluationSerializer>(
          InfrastructureTokens.AiEvaluationRegistryEvaluationSerializer,
        ),
        provider.resolve<IEvaluationStatisticsProvider>(
          InfrastructureTokens.AiEvaluationRegistryEvaluationStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiEvaluationRegistryRegisterEvaluationUseCase,
    (provider) =>
      new RegisterEvaluationUseCase(
        provider.resolve<AiEvaluationRegistryService>(
          InfrastructureTokens.AiEvaluationRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiEvaluationRegistryGetEvaluationUseCase,
    (provider) =>
      new GetEvaluationUseCase(
        provider.resolve<AiEvaluationRegistryService>(
          InfrastructureTokens.AiEvaluationRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiEvaluationRegistryListEvaluationsUseCase,
    (provider) =>
      new ListEvaluationsUseCase(
        provider.resolve<AiEvaluationRegistryService>(
          InfrastructureTokens.AiEvaluationRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiEvaluationRegistryUpdateEvaluationUseCase,
    (provider) =>
      new UpdateEvaluationUseCase(
        provider.resolve<AiEvaluationRegistryService>(
          InfrastructureTokens.AiEvaluationRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiEvaluationRegistryDeleteEvaluationUseCase,
    (provider) =>
      new DeleteEvaluationUseCase(
        provider.resolve<AiEvaluationRegistryService>(
          InfrastructureTokens.AiEvaluationRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiEvaluationRegistryFindEvaluationByNameUseCase,
    (provider) =>
      new FindEvaluationByNameUseCase(
        provider.resolve<AiEvaluationRegistryService>(
          InfrastructureTokens.AiEvaluationRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiEvaluationRegistryListEvaluationsByCategoryUseCase,
    (provider) =>
      new ListEvaluationsByCategoryUseCase(
        provider.resolve<AiEvaluationRegistryService>(
          InfrastructureTokens.AiEvaluationRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiEvaluationRegistryGetEvaluationRegistryStatisticsUseCase,
    (provider) =>
      new GetEvaluationRegistryStatisticsUseCase(
        provider.resolve<AiEvaluationRegistryService>(
          InfrastructureTokens.AiEvaluationRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiEvaluationRegistryApplicationService,
    (provider) =>
      new AiEvaluationRegistryApplicationService(
        provider.resolve<RegisterEvaluationUseCase>(
          InfrastructureTokens.AiEvaluationRegistryRegisterEvaluationUseCase,
        ),
        provider.resolve<GetEvaluationUseCase>(
          InfrastructureTokens.AiEvaluationRegistryGetEvaluationUseCase,
        ),
        provider.resolve<ListEvaluationsUseCase>(
          InfrastructureTokens.AiEvaluationRegistryListEvaluationsUseCase,
        ),
        provider.resolve<UpdateEvaluationUseCase>(
          InfrastructureTokens.AiEvaluationRegistryUpdateEvaluationUseCase,
        ),
        provider.resolve<DeleteEvaluationUseCase>(
          InfrastructureTokens.AiEvaluationRegistryDeleteEvaluationUseCase,
        ),
        provider.resolve<FindEvaluationByNameUseCase>(
          InfrastructureTokens.AiEvaluationRegistryFindEvaluationByNameUseCase,
        ),
        provider.resolve<ListEvaluationsByCategoryUseCase>(
          InfrastructureTokens.AiEvaluationRegistryListEvaluationsByCategoryUseCase,
        ),
        provider.resolve<GetEvaluationRegistryStatisticsUseCase>(
          InfrastructureTokens.AiEvaluationRegistryGetEvaluationRegistryStatisticsUseCase,
        ),
      ),
  );
}
