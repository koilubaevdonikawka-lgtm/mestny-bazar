import type { ISkillCatalog } from "@server/application/ai-skill-registry/contracts/skill-catalog.contract";
import type { ISkillRepository } from "@server/application/ai-skill-registry/contracts/skill-repository.contract";
import type { ISkillSerializer } from "@server/application/ai-skill-registry/contracts/skill-serializer.contract";
import type { ISkillStatisticsProvider } from "@server/application/ai-skill-registry/contracts/skill-statistics-provider.contract";
import type { ISkillValidator } from "@server/application/ai-skill-registry/contracts/skill-validator.contract";
import {
  AiSkillRegistryApplicationService,
  AiSkillRegistryService,
  DeleteSkillUseCase,
  FindSkillByNameUseCase,
  GetSkillRegistryStatisticsUseCase,
  GetSkillUseCase,
  ListSkillsByCategoryUseCase,
  ListSkillsUseCase,
  RegisterSkillUseCase,
  UpdateSkillUseCase,
} from "@server/application/ai-skill-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { SkillRepository } from "@server/infrastructure/ai-skill-registry/skill.repository";
import { DefaultSkillCatalog } from "@server/infrastructure/ai-skill-registry/default-skill.catalog";
import { DefaultSkillStatisticsProvider } from "@server/infrastructure/ai-skill-registry/default-skill-statistics.provider";
import { DefaultSkillValidator } from "@server/infrastructure/ai-skill-registry/default-skill.validator";
import { JsonSkillSerializer } from "@server/infrastructure/ai-skill-registry/json-skill.serializer";

/** Registers AI Skill Registry services and use cases. */
export function registerAiSkillRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiSkillRegistrySkillRepository,
    () => new SkillRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiSkillRegistrySkillCatalog,
    () => new DefaultSkillCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiSkillRegistrySkillValidator,
    () => new DefaultSkillValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiSkillRegistrySkillSerializer,
    () => new JsonSkillSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiSkillRegistrySkillStatisticsProvider,
    () => new DefaultSkillStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiSkillRegistryService,
    (provider) =>
      new AiSkillRegistryService(
        provider.resolve<ISkillRepository>(
          InfrastructureTokens.AiSkillRegistrySkillRepository,
        ),
        provider.resolve<ISkillCatalog>(
          InfrastructureTokens.AiSkillRegistrySkillCatalog,
        ),
        provider.resolve<ISkillValidator>(
          InfrastructureTokens.AiSkillRegistrySkillValidator,
        ),
        provider.resolve<ISkillSerializer>(
          InfrastructureTokens.AiSkillRegistrySkillSerializer,
        ),
        provider.resolve<ISkillStatisticsProvider>(
          InfrastructureTokens.AiSkillRegistrySkillStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiSkillRegistryRegisterSkillUseCase,
    (provider) =>
      new RegisterSkillUseCase(
        provider.resolve<AiSkillRegistryService>(
          InfrastructureTokens.AiSkillRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSkillRegistryGetSkillUseCase,
    (provider) =>
      new GetSkillUseCase(
        provider.resolve<AiSkillRegistryService>(
          InfrastructureTokens.AiSkillRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSkillRegistryListSkillsUseCase,
    (provider) =>
      new ListSkillsUseCase(
        provider.resolve<AiSkillRegistryService>(
          InfrastructureTokens.AiSkillRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSkillRegistryUpdateSkillUseCase,
    (provider) =>
      new UpdateSkillUseCase(
        provider.resolve<AiSkillRegistryService>(
          InfrastructureTokens.AiSkillRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSkillRegistryDeleteSkillUseCase,
    (provider) =>
      new DeleteSkillUseCase(
        provider.resolve<AiSkillRegistryService>(
          InfrastructureTokens.AiSkillRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSkillRegistryFindSkillByNameUseCase,
    (provider) =>
      new FindSkillByNameUseCase(
        provider.resolve<AiSkillRegistryService>(
          InfrastructureTokens.AiSkillRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSkillRegistryListSkillsByCategoryUseCase,
    (provider) =>
      new ListSkillsByCategoryUseCase(
        provider.resolve<AiSkillRegistryService>(
          InfrastructureTokens.AiSkillRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSkillRegistryGetSkillRegistryStatisticsUseCase,
    (provider) =>
      new GetSkillRegistryStatisticsUseCase(
        provider.resolve<AiSkillRegistryService>(
          InfrastructureTokens.AiSkillRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiSkillRegistryApplicationService,
    (provider) =>
      new AiSkillRegistryApplicationService(
        provider.resolve<RegisterSkillUseCase>(
          InfrastructureTokens.AiSkillRegistryRegisterSkillUseCase,
        ),
        provider.resolve<GetSkillUseCase>(
          InfrastructureTokens.AiSkillRegistryGetSkillUseCase,
        ),
        provider.resolve<ListSkillsUseCase>(
          InfrastructureTokens.AiSkillRegistryListSkillsUseCase,
        ),
        provider.resolve<UpdateSkillUseCase>(
          InfrastructureTokens.AiSkillRegistryUpdateSkillUseCase,
        ),
        provider.resolve<DeleteSkillUseCase>(
          InfrastructureTokens.AiSkillRegistryDeleteSkillUseCase,
        ),
        provider.resolve<FindSkillByNameUseCase>(
          InfrastructureTokens.AiSkillRegistryFindSkillByNameUseCase,
        ),
        provider.resolve<ListSkillsByCategoryUseCase>(
          InfrastructureTokens.AiSkillRegistryListSkillsByCategoryUseCase,
        ),
        provider.resolve<GetSkillRegistryStatisticsUseCase>(
          InfrastructureTokens.AiSkillRegistryGetSkillRegistryStatisticsUseCase,
        ),
      ),
  );
}
