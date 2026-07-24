import type { IWorkflowTemplateCatalog } from "@server/application/ai-workflow-template-registry/contracts/workflow-template-catalog.contract";
import type { IWorkflowTemplateRepository } from "@server/application/ai-workflow-template-registry/contracts/workflow-template-repository.contract";
import type { IWorkflowTemplateSerializer } from "@server/application/ai-workflow-template-registry/contracts/workflow-template-serializer.contract";
import type { IWorkflowTemplateStatisticsProvider } from "@server/application/ai-workflow-template-registry/contracts/workflow-template-statistics-provider.contract";
import type { IWorkflowTemplateValidator } from "@server/application/ai-workflow-template-registry/contracts/workflow-template-validator.contract";
import {
  AiWorkflowTemplateRegistryApplicationService,
  AiWorkflowTemplateRegistryService,
  DeleteWorkflowTemplateUseCase,
  FindWorkflowTemplateByNameUseCase,
  GetWorkflowTemplateRegistryStatisticsUseCase,
  GetWorkflowTemplateUseCase,
  ListWorkflowTemplatesByCategoryUseCase,
  ListWorkflowTemplatesUseCase,
  RegisterWorkflowTemplateUseCase,
  UpdateWorkflowTemplateUseCase,
} from "@server/application/ai-workflow-template-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { WorkflowTemplateRepository } from "@server/infrastructure/ai-workflow-template-registry/workflow-template.repository";
import { DefaultWorkflowTemplateCatalog } from "@server/infrastructure/ai-workflow-template-registry/default-workflow-template.catalog";
import { DefaultWorkflowTemplateStatisticsProvider } from "@server/infrastructure/ai-workflow-template-registry/default-workflow-template-statistics.provider";
import { DefaultWorkflowTemplateValidator } from "@server/infrastructure/ai-workflow-template-registry/default-workflow-template.validator";
import { JsonWorkflowTemplateSerializer } from "@server/infrastructure/ai-workflow-template-registry/json-workflow-template.serializer";

/** Registers AI Workflow Template Registry services and use cases. */
export function registerAiWorkflowTemplateRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiWorkflowTemplateRegistryWorkflowTemplateRepository,
    () => new WorkflowTemplateRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiWorkflowTemplateRegistryWorkflowTemplateCatalog,
    () => new DefaultWorkflowTemplateCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiWorkflowTemplateRegistryWorkflowTemplateValidator,
    () => new DefaultWorkflowTemplateValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiWorkflowTemplateRegistryWorkflowTemplateSerializer,
    () => new JsonWorkflowTemplateSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiWorkflowTemplateRegistryWorkflowTemplateStatisticsProvider,
    () => new DefaultWorkflowTemplateStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiWorkflowTemplateRegistryService,
    (provider) =>
      new AiWorkflowTemplateRegistryService(
        provider.resolve<IWorkflowTemplateRepository>(
          InfrastructureTokens.AiWorkflowTemplateRegistryWorkflowTemplateRepository,
        ),
        provider.resolve<IWorkflowTemplateCatalog>(
          InfrastructureTokens.AiWorkflowTemplateRegistryWorkflowTemplateCatalog,
        ),
        provider.resolve<IWorkflowTemplateValidator>(
          InfrastructureTokens.AiWorkflowTemplateRegistryWorkflowTemplateValidator,
        ),
        provider.resolve<IWorkflowTemplateSerializer>(
          InfrastructureTokens.AiWorkflowTemplateRegistryWorkflowTemplateSerializer,
        ),
        provider.resolve<IWorkflowTemplateStatisticsProvider>(
          InfrastructureTokens.AiWorkflowTemplateRegistryWorkflowTemplateStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiWorkflowTemplateRegistryRegisterWorkflowTemplateUseCase,
    (provider) =>
      new RegisterWorkflowTemplateUseCase(
        provider.resolve<AiWorkflowTemplateRegistryService>(
          InfrastructureTokens.AiWorkflowTemplateRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiWorkflowTemplateRegistryGetWorkflowTemplateUseCase,
    (provider) =>
      new GetWorkflowTemplateUseCase(
        provider.resolve<AiWorkflowTemplateRegistryService>(
          InfrastructureTokens.AiWorkflowTemplateRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiWorkflowTemplateRegistryListWorkflowTemplatesUseCase,
    (provider) =>
      new ListWorkflowTemplatesUseCase(
        provider.resolve<AiWorkflowTemplateRegistryService>(
          InfrastructureTokens.AiWorkflowTemplateRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiWorkflowTemplateRegistryUpdateWorkflowTemplateUseCase,
    (provider) =>
      new UpdateWorkflowTemplateUseCase(
        provider.resolve<AiWorkflowTemplateRegistryService>(
          InfrastructureTokens.AiWorkflowTemplateRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiWorkflowTemplateRegistryDeleteWorkflowTemplateUseCase,
    (provider) =>
      new DeleteWorkflowTemplateUseCase(
        provider.resolve<AiWorkflowTemplateRegistryService>(
          InfrastructureTokens.AiWorkflowTemplateRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiWorkflowTemplateRegistryFindWorkflowTemplateByNameUseCase,
    (provider) =>
      new FindWorkflowTemplateByNameUseCase(
        provider.resolve<AiWorkflowTemplateRegistryService>(
          InfrastructureTokens.AiWorkflowTemplateRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiWorkflowTemplateRegistryListWorkflowTemplatesByCategoryUseCase,
    (provider) =>
      new ListWorkflowTemplatesByCategoryUseCase(
        provider.resolve<AiWorkflowTemplateRegistryService>(
          InfrastructureTokens.AiWorkflowTemplateRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiWorkflowTemplateRegistryGetWorkflowTemplateRegistryStatisticsUseCase,
    (provider) =>
      new GetWorkflowTemplateRegistryStatisticsUseCase(
        provider.resolve<AiWorkflowTemplateRegistryService>(
          InfrastructureTokens.AiWorkflowTemplateRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiWorkflowTemplateRegistryApplicationService,
    (provider) =>
      new AiWorkflowTemplateRegistryApplicationService(
        provider.resolve<RegisterWorkflowTemplateUseCase>(
          InfrastructureTokens.AiWorkflowTemplateRegistryRegisterWorkflowTemplateUseCase,
        ),
        provider.resolve<GetWorkflowTemplateUseCase>(
          InfrastructureTokens.AiWorkflowTemplateRegistryGetWorkflowTemplateUseCase,
        ),
        provider.resolve<ListWorkflowTemplatesUseCase>(
          InfrastructureTokens.AiWorkflowTemplateRegistryListWorkflowTemplatesUseCase,
        ),
        provider.resolve<UpdateWorkflowTemplateUseCase>(
          InfrastructureTokens.AiWorkflowTemplateRegistryUpdateWorkflowTemplateUseCase,
        ),
        provider.resolve<DeleteWorkflowTemplateUseCase>(
          InfrastructureTokens.AiWorkflowTemplateRegistryDeleteWorkflowTemplateUseCase,
        ),
        provider.resolve<FindWorkflowTemplateByNameUseCase>(
          InfrastructureTokens.AiWorkflowTemplateRegistryFindWorkflowTemplateByNameUseCase,
        ),
        provider.resolve<ListWorkflowTemplatesByCategoryUseCase>(
          InfrastructureTokens.AiWorkflowTemplateRegistryListWorkflowTemplatesByCategoryUseCase,
        ),
        provider.resolve<GetWorkflowTemplateRegistryStatisticsUseCase>(
          InfrastructureTokens.AiWorkflowTemplateRegistryGetWorkflowTemplateRegistryStatisticsUseCase,
        ),
      ),
  );
}
