import type { ITemplateCatalog } from "@server/application/ai-template-registry/contracts/template-catalog.contract";
import type { ITemplateRepository } from "@server/application/ai-template-registry/contracts/template-repository.contract";
import type { ITemplateSerializer } from "@server/application/ai-template-registry/contracts/template-serializer.contract";
import type { ITemplateStatisticsProvider } from "@server/application/ai-template-registry/contracts/template-statistics-provider.contract";
import type { ITemplateValidator } from "@server/application/ai-template-registry/contracts/template-validator.contract";
import {
  AiTemplateRegistryApplicationService,
  AiTemplateRegistryService,
  DeleteTemplateUseCase,
  FindTemplateByNameUseCase,
  GetTemplateRegistryStatisticsUseCase,
  GetTemplateUseCase,
  ListTemplatesByCategoryUseCase,
  ListTemplatesUseCase,
  RegisterTemplateUseCase,
  UpdateTemplateUseCase,
} from "@server/application/ai-template-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { TemplateRepository } from "@server/infrastructure/ai-template-registry/template.repository";
import { DefaultTemplateCatalog } from "@server/infrastructure/ai-template-registry/default-template.catalog";
import { DefaultTemplateStatisticsProvider } from "@server/infrastructure/ai-template-registry/default-template-statistics.provider";
import { DefaultTemplateValidator } from "@server/infrastructure/ai-template-registry/default-template.validator";
import { JsonTemplateSerializer } from "@server/infrastructure/ai-template-registry/json-template.serializer";

/** Registers AI Template Registry services and use cases. */
export function registerAiTemplateRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiTemplateRegistryTemplateRepository,
    () => new TemplateRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiTemplateRegistryTemplateCatalog,
    () => new DefaultTemplateCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiTemplateRegistryTemplateValidator,
    () => new DefaultTemplateValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiTemplateRegistryTemplateSerializer,
    () => new JsonTemplateSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiTemplateRegistryTemplateStatisticsProvider,
    () => new DefaultTemplateStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiTemplateRegistryService,
    (provider) =>
      new AiTemplateRegistryService(
        provider.resolve<ITemplateRepository>(
          InfrastructureTokens.AiTemplateRegistryTemplateRepository,
        ),
        provider.resolve<ITemplateCatalog>(
          InfrastructureTokens.AiTemplateRegistryTemplateCatalog,
        ),
        provider.resolve<ITemplateValidator>(
          InfrastructureTokens.AiTemplateRegistryTemplateValidator,
        ),
        provider.resolve<ITemplateSerializer>(
          InfrastructureTokens.AiTemplateRegistryTemplateSerializer,
        ),
        provider.resolve<ITemplateStatisticsProvider>(
          InfrastructureTokens.AiTemplateRegistryTemplateStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiTemplateRegistryRegisterTemplateUseCase,
    (provider) =>
      new RegisterTemplateUseCase(
        provider.resolve<AiTemplateRegistryService>(
          InfrastructureTokens.AiTemplateRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiTemplateRegistryGetTemplateUseCase,
    (provider) =>
      new GetTemplateUseCase(
        provider.resolve<AiTemplateRegistryService>(
          InfrastructureTokens.AiTemplateRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiTemplateRegistryListTemplatesUseCase,
    (provider) =>
      new ListTemplatesUseCase(
        provider.resolve<AiTemplateRegistryService>(
          InfrastructureTokens.AiTemplateRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiTemplateRegistryUpdateTemplateUseCase,
    (provider) =>
      new UpdateTemplateUseCase(
        provider.resolve<AiTemplateRegistryService>(
          InfrastructureTokens.AiTemplateRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiTemplateRegistryDeleteTemplateUseCase,
    (provider) =>
      new DeleteTemplateUseCase(
        provider.resolve<AiTemplateRegistryService>(
          InfrastructureTokens.AiTemplateRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiTemplateRegistryFindTemplateByNameUseCase,
    (provider) =>
      new FindTemplateByNameUseCase(
        provider.resolve<AiTemplateRegistryService>(
          InfrastructureTokens.AiTemplateRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiTemplateRegistryListTemplatesByCategoryUseCase,
    (provider) =>
      new ListTemplatesByCategoryUseCase(
        provider.resolve<AiTemplateRegistryService>(
          InfrastructureTokens.AiTemplateRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiTemplateRegistryGetTemplateRegistryStatisticsUseCase,
    (provider) =>
      new GetTemplateRegistryStatisticsUseCase(
        provider.resolve<AiTemplateRegistryService>(
          InfrastructureTokens.AiTemplateRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiTemplateRegistryApplicationService,
    (provider) =>
      new AiTemplateRegistryApplicationService(
        provider.resolve<RegisterTemplateUseCase>(
          InfrastructureTokens.AiTemplateRegistryRegisterTemplateUseCase,
        ),
        provider.resolve<GetTemplateUseCase>(
          InfrastructureTokens.AiTemplateRegistryGetTemplateUseCase,
        ),
        provider.resolve<ListTemplatesUseCase>(
          InfrastructureTokens.AiTemplateRegistryListTemplatesUseCase,
        ),
        provider.resolve<UpdateTemplateUseCase>(
          InfrastructureTokens.AiTemplateRegistryUpdateTemplateUseCase,
        ),
        provider.resolve<DeleteTemplateUseCase>(
          InfrastructureTokens.AiTemplateRegistryDeleteTemplateUseCase,
        ),
        provider.resolve<FindTemplateByNameUseCase>(
          InfrastructureTokens.AiTemplateRegistryFindTemplateByNameUseCase,
        ),
        provider.resolve<ListTemplatesByCategoryUseCase>(
          InfrastructureTokens.AiTemplateRegistryListTemplatesByCategoryUseCase,
        ),
        provider.resolve<GetTemplateRegistryStatisticsUseCase>(
          InfrastructureTokens.AiTemplateRegistryGetTemplateRegistryStatisticsUseCase,
        ),
      ),
  );
}
