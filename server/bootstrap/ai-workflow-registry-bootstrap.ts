import type { IWorkflowCatalog } from "@server/application/ai-workflow-registry/contracts/workflow-catalog.contract";
import type { IWorkflowRepository } from "@server/application/ai-workflow-registry/contracts/workflow-repository.contract";
import type { IWorkflowSerializer } from "@server/application/ai-workflow-registry/contracts/workflow-serializer.contract";
import type { IWorkflowStatisticsProvider } from "@server/application/ai-workflow-registry/contracts/workflow-statistics-provider.contract";
import type { IWorkflowValidator } from "@server/application/ai-workflow-registry/contracts/workflow-validator.contract";
import {
  AiWorkflowRegistryApplicationService,
  AiWorkflowRegistryService,
  DeleteWorkflowUseCase,
  FindWorkflowByNameUseCase,
  GetWorkflowRegistryStatisticsUseCase,
  GetWorkflowUseCase,
  ListWorkflowsByCategoryUseCase,
  ListWorkflowsUseCase,
  RegisterWorkflowUseCase,
  UpdateWorkflowUseCase,
} from "@server/application/ai-workflow-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { WorkflowRepository } from "@server/infrastructure/ai-workflow-registry/workflow.repository";
import { DefaultWorkflowCatalog } from "@server/infrastructure/ai-workflow-registry/default-workflow.catalog";
import { DefaultWorkflowStatisticsProvider } from "@server/infrastructure/ai-workflow-registry/default-workflow-statistics.provider";
import { DefaultWorkflowValidator } from "@server/infrastructure/ai-workflow-registry/default-workflow.validator";
import { JsonWorkflowSerializer } from "@server/infrastructure/ai-workflow-registry/json-workflow.serializer";

/** Registers AI Workflow Registry services and use cases. */
export function registerAiWorkflowRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiWorkflowRegistryWorkflowRepository,
    () => new WorkflowRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiWorkflowRegistryWorkflowCatalog,
    () => new DefaultWorkflowCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiWorkflowRegistryWorkflowValidator,
    () => new DefaultWorkflowValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiWorkflowRegistryWorkflowSerializer,
    () => new JsonWorkflowSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiWorkflowRegistryWorkflowStatisticsProvider,
    () => new DefaultWorkflowStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiWorkflowRegistryService,
    (provider) =>
      new AiWorkflowRegistryService(
        provider.resolve<IWorkflowRepository>(
          InfrastructureTokens.AiWorkflowRegistryWorkflowRepository,
        ),
        provider.resolve<IWorkflowCatalog>(
          InfrastructureTokens.AiWorkflowRegistryWorkflowCatalog,
        ),
        provider.resolve<IWorkflowValidator>(
          InfrastructureTokens.AiWorkflowRegistryWorkflowValidator,
        ),
        provider.resolve<IWorkflowSerializer>(
          InfrastructureTokens.AiWorkflowRegistryWorkflowSerializer,
        ),
        provider.resolve<IWorkflowStatisticsProvider>(
          InfrastructureTokens.AiWorkflowRegistryWorkflowStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiWorkflowRegistryRegisterWorkflowUseCase,
    (provider) =>
      new RegisterWorkflowUseCase(
        provider.resolve<AiWorkflowRegistryService>(
          InfrastructureTokens.AiWorkflowRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiWorkflowRegistryGetWorkflowUseCase,
    (provider) =>
      new GetWorkflowUseCase(
        provider.resolve<AiWorkflowRegistryService>(
          InfrastructureTokens.AiWorkflowRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiWorkflowRegistryListWorkflowsUseCase,
    (provider) =>
      new ListWorkflowsUseCase(
        provider.resolve<AiWorkflowRegistryService>(
          InfrastructureTokens.AiWorkflowRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiWorkflowRegistryUpdateWorkflowUseCase,
    (provider) =>
      new UpdateWorkflowUseCase(
        provider.resolve<AiWorkflowRegistryService>(
          InfrastructureTokens.AiWorkflowRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiWorkflowRegistryDeleteWorkflowUseCase,
    (provider) =>
      new DeleteWorkflowUseCase(
        provider.resolve<AiWorkflowRegistryService>(
          InfrastructureTokens.AiWorkflowRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiWorkflowRegistryFindWorkflowByNameUseCase,
    (provider) =>
      new FindWorkflowByNameUseCase(
        provider.resolve<AiWorkflowRegistryService>(
          InfrastructureTokens.AiWorkflowRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiWorkflowRegistryListWorkflowsByCategoryUseCase,
    (provider) =>
      new ListWorkflowsByCategoryUseCase(
        provider.resolve<AiWorkflowRegistryService>(
          InfrastructureTokens.AiWorkflowRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiWorkflowRegistryGetWorkflowRegistryStatisticsUseCase,
    (provider) =>
      new GetWorkflowRegistryStatisticsUseCase(
        provider.resolve<AiWorkflowRegistryService>(
          InfrastructureTokens.AiWorkflowRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiWorkflowRegistryApplicationService,
    (provider) =>
      new AiWorkflowRegistryApplicationService(
        provider.resolve<RegisterWorkflowUseCase>(
          InfrastructureTokens.AiWorkflowRegistryRegisterWorkflowUseCase,
        ),
        provider.resolve<GetWorkflowUseCase>(
          InfrastructureTokens.AiWorkflowRegistryGetWorkflowUseCase,
        ),
        provider.resolve<ListWorkflowsUseCase>(
          InfrastructureTokens.AiWorkflowRegistryListWorkflowsUseCase,
        ),
        provider.resolve<UpdateWorkflowUseCase>(
          InfrastructureTokens.AiWorkflowRegistryUpdateWorkflowUseCase,
        ),
        provider.resolve<DeleteWorkflowUseCase>(
          InfrastructureTokens.AiWorkflowRegistryDeleteWorkflowUseCase,
        ),
        provider.resolve<FindWorkflowByNameUseCase>(
          InfrastructureTokens.AiWorkflowRegistryFindWorkflowByNameUseCase,
        ),
        provider.resolve<ListWorkflowsByCategoryUseCase>(
          InfrastructureTokens.AiWorkflowRegistryListWorkflowsByCategoryUseCase,
        ),
        provider.resolve<GetWorkflowRegistryStatisticsUseCase>(
          InfrastructureTokens.AiWorkflowRegistryGetWorkflowRegistryStatisticsUseCase,
        ),
      ),
  );
}
