import type { IRuleCatalog } from "@server/application/ai-rule-registry/contracts/rule-catalog.contract";
import type { IRuleRepository } from "@server/application/ai-rule-registry/contracts/rule-repository.contract";
import type { IRuleSerializer } from "@server/application/ai-rule-registry/contracts/rule-serializer.contract";
import type { IRuleStatisticsProvider } from "@server/application/ai-rule-registry/contracts/rule-statistics-provider.contract";
import type { IRuleValidator } from "@server/application/ai-rule-registry/contracts/rule-validator.contract";
import {
  AiRuleRegistryApplicationService,
  AiRuleRegistryService,
  DeleteRuleUseCase,
  FindRuleByNameUseCase,
  GetRuleRegistryStatisticsUseCase,
  GetRuleUseCase,
  ListRulesByCategoryUseCase,
  ListRulesUseCase,
  RegisterRuleUseCase,
  UpdateRuleUseCase,
} from "@server/application/ai-rule-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { RuleRepository } from "@server/infrastructure/ai-rule-registry/rule.repository";
import { DefaultRuleCatalog } from "@server/infrastructure/ai-rule-registry/default-rule.catalog";
import { DefaultRuleStatisticsProvider } from "@server/infrastructure/ai-rule-registry/default-rule-statistics.provider";
import { DefaultRuleValidator } from "@server/infrastructure/ai-rule-registry/default-rule.validator";
import { JsonRuleSerializer } from "@server/infrastructure/ai-rule-registry/json-rule.serializer";

/** Registers AI Rule Registry services and use cases. */
export function registerAiRuleRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiRuleRegistryRuleRepository,
    () => new RuleRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiRuleRegistryRuleCatalog,
    () => new DefaultRuleCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiRuleRegistryRuleValidator,
    () => new DefaultRuleValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiRuleRegistryRuleSerializer,
    () => new JsonRuleSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiRuleRegistryRuleStatisticsProvider,
    () => new DefaultRuleStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiRuleRegistryService,
    (provider) =>
      new AiRuleRegistryService(
        provider.resolve<IRuleRepository>(
          InfrastructureTokens.AiRuleRegistryRuleRepository,
        ),
        provider.resolve<IRuleCatalog>(
          InfrastructureTokens.AiRuleRegistryRuleCatalog,
        ),
        provider.resolve<IRuleValidator>(
          InfrastructureTokens.AiRuleRegistryRuleValidator,
        ),
        provider.resolve<IRuleSerializer>(
          InfrastructureTokens.AiRuleRegistryRuleSerializer,
        ),
        provider.resolve<IRuleStatisticsProvider>(
          InfrastructureTokens.AiRuleRegistryRuleStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiRuleRegistryRegisterRuleUseCase,
    (provider) =>
      new RegisterRuleUseCase(
        provider.resolve<AiRuleRegistryService>(
          InfrastructureTokens.AiRuleRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiRuleRegistryGetRuleUseCase,
    (provider) =>
      new GetRuleUseCase(
        provider.resolve<AiRuleRegistryService>(
          InfrastructureTokens.AiRuleRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiRuleRegistryListRulesUseCase,
    (provider) =>
      new ListRulesUseCase(
        provider.resolve<AiRuleRegistryService>(
          InfrastructureTokens.AiRuleRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiRuleRegistryUpdateRuleUseCase,
    (provider) =>
      new UpdateRuleUseCase(
        provider.resolve<AiRuleRegistryService>(
          InfrastructureTokens.AiRuleRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiRuleRegistryDeleteRuleUseCase,
    (provider) =>
      new DeleteRuleUseCase(
        provider.resolve<AiRuleRegistryService>(
          InfrastructureTokens.AiRuleRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiRuleRegistryFindRuleByNameUseCase,
    (provider) =>
      new FindRuleByNameUseCase(
        provider.resolve<AiRuleRegistryService>(
          InfrastructureTokens.AiRuleRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiRuleRegistryListRulesByCategoryUseCase,
    (provider) =>
      new ListRulesByCategoryUseCase(
        provider.resolve<AiRuleRegistryService>(
          InfrastructureTokens.AiRuleRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiRuleRegistryGetRuleRegistryStatisticsUseCase,
    (provider) =>
      new GetRuleRegistryStatisticsUseCase(
        provider.resolve<AiRuleRegistryService>(
          InfrastructureTokens.AiRuleRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiRuleRegistryApplicationService,
    (provider) =>
      new AiRuleRegistryApplicationService(
        provider.resolve<RegisterRuleUseCase>(
          InfrastructureTokens.AiRuleRegistryRegisterRuleUseCase,
        ),
        provider.resolve<GetRuleUseCase>(
          InfrastructureTokens.AiRuleRegistryGetRuleUseCase,
        ),
        provider.resolve<ListRulesUseCase>(
          InfrastructureTokens.AiRuleRegistryListRulesUseCase,
        ),
        provider.resolve<UpdateRuleUseCase>(
          InfrastructureTokens.AiRuleRegistryUpdateRuleUseCase,
        ),
        provider.resolve<DeleteRuleUseCase>(
          InfrastructureTokens.AiRuleRegistryDeleteRuleUseCase,
        ),
        provider.resolve<FindRuleByNameUseCase>(
          InfrastructureTokens.AiRuleRegistryFindRuleByNameUseCase,
        ),
        provider.resolve<ListRulesByCategoryUseCase>(
          InfrastructureTokens.AiRuleRegistryListRulesByCategoryUseCase,
        ),
        provider.resolve<GetRuleRegistryStatisticsUseCase>(
          InfrastructureTokens.AiRuleRegistryGetRuleRegistryStatisticsUseCase,
        ),
      ),
  );
}
