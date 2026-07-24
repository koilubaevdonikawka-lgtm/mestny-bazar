import type { IComplianceRuleCatalog } from "@server/application/ai-compliance-rule-registry/contracts/compliance-rule-catalog.contract";
import type { IComplianceRuleRepository } from "@server/application/ai-compliance-rule-registry/contracts/compliance-rule-repository.contract";
import type { IComplianceRuleSerializer } from "@server/application/ai-compliance-rule-registry/contracts/compliance-rule-serializer.contract";
import type { IComplianceRuleStatisticsProvider } from "@server/application/ai-compliance-rule-registry/contracts/compliance-rule-statistics-provider.contract";
import type { IComplianceRuleValidator } from "@server/application/ai-compliance-rule-registry/contracts/compliance-rule-validator.contract";
import {
  AiComplianceRuleRegistryApplicationService,
  AiComplianceRuleRegistryService,
  DeleteComplianceRuleUseCase,
  FindComplianceRuleByNameUseCase,
  GetComplianceRuleRegistryStatisticsUseCase,
  GetComplianceRuleUseCase,
  ListComplianceRulesByCategoryUseCase,
  ListComplianceRulesUseCase,
  RegisterComplianceRuleUseCase,
  UpdateComplianceRuleUseCase,
} from "@server/application/ai-compliance-rule-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { ComplianceRuleRepository } from "@server/infrastructure/ai-compliance-rule-registry/compliance-rule.repository";
import { DefaultComplianceRuleCatalog } from "@server/infrastructure/ai-compliance-rule-registry/default-compliance-rule.catalog";
import { DefaultComplianceRuleStatisticsProvider } from "@server/infrastructure/ai-compliance-rule-registry/default-compliance-rule-statistics.provider";
import { DefaultComplianceRuleValidator } from "@server/infrastructure/ai-compliance-rule-registry/default-compliance-rule.validator";
import { JsonComplianceRuleSerializer } from "@server/infrastructure/ai-compliance-rule-registry/json-compliance-rule.serializer";

/** Registers AI Compliance Rule Registry services and use cases. */
export function registerAiComplianceRuleRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiComplianceRuleRegistryComplianceRuleRepository,
    () => new ComplianceRuleRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiComplianceRuleRegistryComplianceRuleCatalog,
    () => new DefaultComplianceRuleCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiComplianceRuleRegistryComplianceRuleValidator,
    () => new DefaultComplianceRuleValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiComplianceRuleRegistryComplianceRuleSerializer,
    () => new JsonComplianceRuleSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiComplianceRuleRegistryComplianceRuleStatisticsProvider,
    () => new DefaultComplianceRuleStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiComplianceRuleRegistryService,
    (provider) =>
      new AiComplianceRuleRegistryService(
        provider.resolve<IComplianceRuleRepository>(
          InfrastructureTokens.AiComplianceRuleRegistryComplianceRuleRepository,
        ),
        provider.resolve<IComplianceRuleCatalog>(
          InfrastructureTokens.AiComplianceRuleRegistryComplianceRuleCatalog,
        ),
        provider.resolve<IComplianceRuleValidator>(
          InfrastructureTokens.AiComplianceRuleRegistryComplianceRuleValidator,
        ),
        provider.resolve<IComplianceRuleSerializer>(
          InfrastructureTokens.AiComplianceRuleRegistryComplianceRuleSerializer,
        ),
        provider.resolve<IComplianceRuleStatisticsProvider>(
          InfrastructureTokens.AiComplianceRuleRegistryComplianceRuleStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiComplianceRuleRegistryRegisterComplianceRuleUseCase,
    (provider) =>
      new RegisterComplianceRuleUseCase(
        provider.resolve<AiComplianceRuleRegistryService>(
          InfrastructureTokens.AiComplianceRuleRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiComplianceRuleRegistryGetComplianceRuleUseCase,
    (provider) =>
      new GetComplianceRuleUseCase(
        provider.resolve<AiComplianceRuleRegistryService>(
          InfrastructureTokens.AiComplianceRuleRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiComplianceRuleRegistryListComplianceRulesUseCase,
    (provider) =>
      new ListComplianceRulesUseCase(
        provider.resolve<AiComplianceRuleRegistryService>(
          InfrastructureTokens.AiComplianceRuleRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiComplianceRuleRegistryUpdateComplianceRuleUseCase,
    (provider) =>
      new UpdateComplianceRuleUseCase(
        provider.resolve<AiComplianceRuleRegistryService>(
          InfrastructureTokens.AiComplianceRuleRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiComplianceRuleRegistryDeleteComplianceRuleUseCase,
    (provider) =>
      new DeleteComplianceRuleUseCase(
        provider.resolve<AiComplianceRuleRegistryService>(
          InfrastructureTokens.AiComplianceRuleRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiComplianceRuleRegistryFindComplianceRuleByNameUseCase,
    (provider) =>
      new FindComplianceRuleByNameUseCase(
        provider.resolve<AiComplianceRuleRegistryService>(
          InfrastructureTokens.AiComplianceRuleRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiComplianceRuleRegistryListComplianceRulesByCategoryUseCase,
    (provider) =>
      new ListComplianceRulesByCategoryUseCase(
        provider.resolve<AiComplianceRuleRegistryService>(
          InfrastructureTokens.AiComplianceRuleRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiComplianceRuleRegistryGetComplianceRuleRegistryStatisticsUseCase,
    (provider) =>
      new GetComplianceRuleRegistryStatisticsUseCase(
        provider.resolve<AiComplianceRuleRegistryService>(
          InfrastructureTokens.AiComplianceRuleRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiComplianceRuleRegistryApplicationService,
    (provider) =>
      new AiComplianceRuleRegistryApplicationService(
        provider.resolve<RegisterComplianceRuleUseCase>(
          InfrastructureTokens.AiComplianceRuleRegistryRegisterComplianceRuleUseCase,
        ),
        provider.resolve<GetComplianceRuleUseCase>(
          InfrastructureTokens.AiComplianceRuleRegistryGetComplianceRuleUseCase,
        ),
        provider.resolve<ListComplianceRulesUseCase>(
          InfrastructureTokens.AiComplianceRuleRegistryListComplianceRulesUseCase,
        ),
        provider.resolve<UpdateComplianceRuleUseCase>(
          InfrastructureTokens.AiComplianceRuleRegistryUpdateComplianceRuleUseCase,
        ),
        provider.resolve<DeleteComplianceRuleUseCase>(
          InfrastructureTokens.AiComplianceRuleRegistryDeleteComplianceRuleUseCase,
        ),
        provider.resolve<FindComplianceRuleByNameUseCase>(
          InfrastructureTokens.AiComplianceRuleRegistryFindComplianceRuleByNameUseCase,
        ),
        provider.resolve<ListComplianceRulesByCategoryUseCase>(
          InfrastructureTokens.AiComplianceRuleRegistryListComplianceRulesByCategoryUseCase,
        ),
        provider.resolve<GetComplianceRuleRegistryStatisticsUseCase>(
          InfrastructureTokens.AiComplianceRuleRegistryGetComplianceRuleRegistryStatisticsUseCase,
        ),
      ),
  );
}
