import type { ISemanticEndpointRepository } from "@server/application/ai-semantic-api/contracts/semantic-endpoint-repository.contract";
import type { ISemanticRequestHistoryRepository } from "@server/application/ai-semantic-api/contracts/semantic-request-history-repository.contract";
import type { ISemanticRequestProcessor } from "@server/application/ai-semantic-api/contracts/semantic-request-processor.contract";
import type { ISemanticSchemaRegistry } from "@server/application/ai-semantic-api/contracts/semantic-schema-registry.contract";
import type { ISemanticStatisticsProvider } from "@server/application/ai-semantic-api/contracts/semantic-statistics-provider.contract";
import {
  AiSemanticApiApplicationService,
  AiSemanticApiService,
  DeleteSemanticEndpointUseCase,
  GetSemanticApiStatisticsUseCase,
  GetSemanticEndpointUseCase,
  GetSemanticRequestHistoryUseCase,
  HandleSemanticRequestUseCase,
  ListSemanticEndpointsUseCase,
  RegisterSemanticEndpointUseCase,
  UpdateSemanticEndpointUseCase,
} from "@server/application/ai-semantic-api";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { DefaultSemanticRequestProcessor } from "@server/infrastructure/ai-semantic-api/default-semantic-request.processor";
import { DefaultSemanticSchemaRegistry } from "@server/infrastructure/ai-semantic-api/default-semantic-schema.registry";
import { DefaultSemanticStatisticsProvider } from "@server/infrastructure/ai-semantic-api/default-semantic-statistics.provider";
import { SemanticEndpointRepository } from "@server/infrastructure/ai-semantic-api/semantic-endpoint.repository";
import { SemanticRequestHistoryRepository } from "@server/infrastructure/ai-semantic-api/semantic-request-history.repository";

/** Registers AI Semantic API services and use cases. */
export function registerAiSemanticApiApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiSemanticApiSemanticEndpointRepository,
    () => new SemanticEndpointRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiSemanticApiSemanticRequestProcessor,
    () => new DefaultSemanticRequestProcessor(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiSemanticApiSemanticSchemaRegistry,
    () => new DefaultSemanticSchemaRegistry(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiSemanticApiSemanticRequestHistoryRepository,
    () => new SemanticRequestHistoryRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiSemanticApiSemanticStatisticsProvider,
    () => new DefaultSemanticStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiSemanticApiService,
    (provider) =>
      new AiSemanticApiService(
        provider.resolve<ISemanticEndpointRepository>(
          InfrastructureTokens.AiSemanticApiSemanticEndpointRepository,
        ),
        provider.resolve<ISemanticRequestProcessor>(
          InfrastructureTokens.AiSemanticApiSemanticRequestProcessor,
        ),
        provider.resolve<ISemanticSchemaRegistry>(
          InfrastructureTokens.AiSemanticApiSemanticSchemaRegistry,
        ),
        provider.resolve<ISemanticRequestHistoryRepository>(
          InfrastructureTokens.AiSemanticApiSemanticRequestHistoryRepository,
        ),
        provider.resolve<ISemanticStatisticsProvider>(
          InfrastructureTokens.AiSemanticApiSemanticStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiSemanticApiRegisterSemanticEndpointUseCase,
    (provider) =>
      new RegisterSemanticEndpointUseCase(
        provider.resolve<AiSemanticApiService>(InfrastructureTokens.AiSemanticApiService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSemanticApiGetSemanticEndpointUseCase,
    (provider) =>
      new GetSemanticEndpointUseCase(
        provider.resolve<AiSemanticApiService>(InfrastructureTokens.AiSemanticApiService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSemanticApiListSemanticEndpointsUseCase,
    (provider) =>
      new ListSemanticEndpointsUseCase(
        provider.resolve<AiSemanticApiService>(InfrastructureTokens.AiSemanticApiService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSemanticApiUpdateSemanticEndpointUseCase,
    (provider) =>
      new UpdateSemanticEndpointUseCase(
        provider.resolve<AiSemanticApiService>(InfrastructureTokens.AiSemanticApiService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSemanticApiDeleteSemanticEndpointUseCase,
    (provider) =>
      new DeleteSemanticEndpointUseCase(
        provider.resolve<AiSemanticApiService>(InfrastructureTokens.AiSemanticApiService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSemanticApiHandleSemanticRequestUseCase,
    (provider) =>
      new HandleSemanticRequestUseCase(
        provider.resolve<AiSemanticApiService>(InfrastructureTokens.AiSemanticApiService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSemanticApiGetSemanticRequestHistoryUseCase,
    (provider) =>
      new GetSemanticRequestHistoryUseCase(
        provider.resolve<AiSemanticApiService>(InfrastructureTokens.AiSemanticApiService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSemanticApiGetSemanticApiStatisticsUseCase,
    (provider) =>
      new GetSemanticApiStatisticsUseCase(
        provider.resolve<AiSemanticApiService>(InfrastructureTokens.AiSemanticApiService),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiSemanticApiApplicationService,
    (provider) =>
      new AiSemanticApiApplicationService(
        provider.resolve<RegisterSemanticEndpointUseCase>(
          InfrastructureTokens.AiSemanticApiRegisterSemanticEndpointUseCase,
        ),
        provider.resolve<GetSemanticEndpointUseCase>(
          InfrastructureTokens.AiSemanticApiGetSemanticEndpointUseCase,
        ),
        provider.resolve<ListSemanticEndpointsUseCase>(
          InfrastructureTokens.AiSemanticApiListSemanticEndpointsUseCase,
        ),
        provider.resolve<UpdateSemanticEndpointUseCase>(
          InfrastructureTokens.AiSemanticApiUpdateSemanticEndpointUseCase,
        ),
        provider.resolve<DeleteSemanticEndpointUseCase>(
          InfrastructureTokens.AiSemanticApiDeleteSemanticEndpointUseCase,
        ),
        provider.resolve<HandleSemanticRequestUseCase>(
          InfrastructureTokens.AiSemanticApiHandleSemanticRequestUseCase,
        ),
        provider.resolve<GetSemanticRequestHistoryUseCase>(
          InfrastructureTokens.AiSemanticApiGetSemanticRequestHistoryUseCase,
        ),
        provider.resolve<GetSemanticApiStatisticsUseCase>(
          InfrastructureTokens.AiSemanticApiGetSemanticApiStatisticsUseCase,
        ),
      ),
  );
}
