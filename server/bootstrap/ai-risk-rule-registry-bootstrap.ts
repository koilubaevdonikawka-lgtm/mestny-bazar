import type { IRiskRuleCatalog } from "@server/application/ai-risk-rule-registry/contracts/risk-rule-catalog.contract";
import type { IRiskRuleRepository } from "@server/application/ai-risk-rule-registry/contracts/risk-rule-repository.contract";
import type { IRiskRuleSerializer } from "@server/application/ai-risk-rule-registry/contracts/risk-rule-serializer.contract";
import type { IRiskRuleStatisticsProvider } from "@server/application/ai-risk-rule-registry/contracts/risk-rule-statistics-provider.contract";
import type { IRiskRuleValidator } from "@server/application/ai-risk-rule-registry/contracts/risk-rule-validator.contract";
import {
  AiRiskRuleRegistryApplicationService,
  AiRiskRuleRegistryService,
  DeleteRiskRuleUseCase,
  FindRiskRuleByNameUseCase,
  GetRiskRuleRegistryStatisticsUseCase,
  GetRiskRuleUseCase,
  ListRiskRulesByCategoryUseCase,
  ListRiskRulesUseCase,
  RegisterRiskRuleUseCase,
  UpdateRiskRuleUseCase,
} from "@server/application/ai-risk-rule-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { RiskRuleRepository } from "@server/infrastructure/ai-risk-rule-registry/risk-rule.repository";
import { DefaultRiskRuleCatalog } from "@server/infrastructure/ai-risk-rule-registry/default-risk-rule.catalog";
import { DefaultRiskRuleStatisticsProvider } from "@server/infrastructure/ai-risk-rule-registry/default-risk-rule-statistics.provider";
import { DefaultRiskRuleValidator } from "@server/infrastructure/ai-risk-rule-registry/default-risk-rule.validator";
import { JsonRiskRuleSerializer } from "@server/infrastructure/ai-risk-rule-registry/json-risk-rule.serializer";

/** Registers AI Risk Rule Registry services and use cases. */
export function registerAiRiskRuleRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiRiskRuleRegistryRiskRuleRepository,
    () => new RiskRuleRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiRiskRuleRegistryRiskRuleCatalog,
    () => new DefaultRiskRuleCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiRiskRuleRegistryRiskRuleValidator,
    () => new DefaultRiskRuleValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiRiskRuleRegistryRiskRuleSerializer,
    () => new JsonRiskRuleSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiRiskRuleRegistryRiskRuleStatisticsProvider,
    () => new DefaultRiskRuleStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiRiskRuleRegistryService,
    (provider) =>
      new AiRiskRuleRegistryService(
        provider.resolve<IRiskRuleRepository>(
          InfrastructureTokens.AiRiskRuleRegistryRiskRuleRepository,
        ),
        provider.resolve<IRiskRuleCatalog>(
          InfrastructureTokens.AiRiskRuleRegistryRiskRuleCatalog,
        ),
        provider.resolve<IRiskRuleValidator>(
          InfrastructureTokens.AiRiskRuleRegistryRiskRuleValidator,
        ),
        provider.resolve<IRiskRuleSerializer>(
          InfrastructureTokens.AiRiskRuleRegistryRiskRuleSerializer,
        ),
        provider.resolve<IRiskRuleStatisticsProvider>(
          InfrastructureTokens.AiRiskRuleRegistryRiskRuleStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiRiskRuleRegistryRegisterRiskRuleUseCase,
    (provider) =>
      new RegisterRiskRuleUseCase(
        provider.resolve<AiRiskRuleRegistryService>(
          InfrastructureTokens.AiRiskRuleRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiRiskRuleRegistryGetRiskRuleUseCase,
    (provider) =>
      new GetRiskRuleUseCase(
        provider.resolve<AiRiskRuleRegistryService>(
          InfrastructureTokens.AiRiskRuleRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiRiskRuleRegistryListRiskRulesUseCase,
    (provider) =>
      new ListRiskRulesUseCase(
        provider.resolve<AiRiskRuleRegistryService>(
          InfrastructureTokens.AiRiskRuleRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiRiskRuleRegistryUpdateRiskRuleUseCase,
    (provider) =>
      new UpdateRiskRuleUseCase(
        provider.resolve<AiRiskRuleRegistryService>(
          InfrastructureTokens.AiRiskRuleRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiRiskRuleRegistryDeleteRiskRuleUseCase,
    (provider) =>
      new DeleteRiskRuleUseCase(
        provider.resolve<AiRiskRuleRegistryService>(
          InfrastructureTokens.AiRiskRuleRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiRiskRuleRegistryFindRiskRuleByNameUseCase,
    (provider) =>
      new FindRiskRuleByNameUseCase(
        provider.resolve<AiRiskRuleRegistryService>(
          InfrastructureTokens.AiRiskRuleRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiRiskRuleRegistryListRiskRulesByCategoryUseCase,
    (provider) =>
      new ListRiskRulesByCategoryUseCase(
        provider.resolve<AiRiskRuleRegistryService>(
          InfrastructureTokens.AiRiskRuleRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiRiskRuleRegistryGetRiskRuleRegistryStatisticsUseCase,
    (provider) =>
      new GetRiskRuleRegistryStatisticsUseCase(
        provider.resolve<AiRiskRuleRegistryService>(
          InfrastructureTokens.AiRiskRuleRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiRiskRuleRegistryApplicationService,
    (provider) =>
      new AiRiskRuleRegistryApplicationService(
        provider.resolve<RegisterRiskRuleUseCase>(
          InfrastructureTokens.AiRiskRuleRegistryRegisterRiskRuleUseCase,
        ),
        provider.resolve<GetRiskRuleUseCase>(
          InfrastructureTokens.AiRiskRuleRegistryGetRiskRuleUseCase,
        ),
        provider.resolve<ListRiskRulesUseCase>(
          InfrastructureTokens.AiRiskRuleRegistryListRiskRulesUseCase,
        ),
        provider.resolve<UpdateRiskRuleUseCase>(
          InfrastructureTokens.AiRiskRuleRegistryUpdateRiskRuleUseCase,
        ),
        provider.resolve<DeleteRiskRuleUseCase>(
          InfrastructureTokens.AiRiskRuleRegistryDeleteRiskRuleUseCase,
        ),
        provider.resolve<FindRiskRuleByNameUseCase>(
          InfrastructureTokens.AiRiskRuleRegistryFindRiskRuleByNameUseCase,
        ),
        provider.resolve<ListRiskRulesByCategoryUseCase>(
          InfrastructureTokens.AiRiskRuleRegistryListRiskRulesByCategoryUseCase,
        ),
        provider.resolve<GetRiskRuleRegistryStatisticsUseCase>(
          InfrastructureTokens.AiRiskRuleRegistryGetRiskRuleRegistryStatisticsUseCase,
        ),
      ),
  );
}
