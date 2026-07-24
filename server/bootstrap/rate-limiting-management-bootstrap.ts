import type { IRateLimitCounter } from "@server/application/rate-limiting-management/contracts/rate-limit-counter.contract";
import type { IRateLimitEvaluator } from "@server/application/rate-limiting-management/contracts/rate-limit-evaluator.contract";
import type { IRateLimitPolicy } from "@server/application/rate-limiting-management/contracts/rate-limit-policy.contract";
import type { IRateLimitRepository } from "@server/application/rate-limiting-management/contracts/rate-limit-repository.contract";
import type { IRateLimitStatisticsProvider } from "@server/application/rate-limiting-management/contracts/rate-limit-statistics-provider.contract";
import {
  CheckRateLimitUseCase,
  DeleteRateLimitRuleUseCase,
  GetRateLimitRuleUseCase,
  GetRateLimitStatisticsUseCase,
  IncrementRateLimitCounterUseCase,
  ListRateLimitRulesUseCase,
  RateLimitingManagementApplicationService,
  RateLimitingManagementService,
  RegisterRateLimitRuleUseCase,
  ResetRateLimitCounterUseCase,
} from "@server/application/rate-limiting-management";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { DefaultRateLimitEvaluator } from "@server/infrastructure/rate-limiting-management/default-rate-limit.evaluator";
import { DefaultRateLimitPolicy } from "@server/infrastructure/rate-limiting-management/default-rate-limit.policy";
import { DefaultRateLimitStatisticsProvider } from "@server/infrastructure/rate-limiting-management/default-rate-limit-statistics.provider";
import { InMemoryRateLimitCounter } from "@server/infrastructure/rate-limiting-management/in-memory-rate-limit.counter";
import { RateLimitRepository } from "@server/infrastructure/rate-limiting-management/rate-limit.repository";

/** Registers rate limiting management services and use cases. */
export function registerRateLimitingManagementApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(InfrastructureTokens.RateLimitingManagementRateLimitRepository, () =>
    new RateLimitRepository(),
  );

  registry.registerSingleton(InfrastructureTokens.RateLimitingManagementRateLimitEvaluator, () =>
    new DefaultRateLimitEvaluator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.RateLimitingManagementRateLimitCounter,
    (provider) =>
      new InMemoryRateLimitCounter(
        provider.resolve<IRateLimitRepository>(
          InfrastructureTokens.RateLimitingManagementRateLimitRepository,
        ),
      ),
  );

  registry.registerSingleton(InfrastructureTokens.RateLimitingManagementRateLimitPolicy, () =>
    new DefaultRateLimitPolicy(),
  );

  registry.registerSingleton(
    InfrastructureTokens.RateLimitingManagementRateLimitStatisticsProvider,
    () => new DefaultRateLimitStatisticsProvider(),
  );

  registry.registerTransient(InfrastructureTokens.RateLimitingManagementService, (provider) =>
    new RateLimitingManagementService(
      provider.resolve<IRateLimitRepository>(
        InfrastructureTokens.RateLimitingManagementRateLimitRepository,
      ),
      provider.resolve<IRateLimitEvaluator>(
        InfrastructureTokens.RateLimitingManagementRateLimitEvaluator,
      ),
      provider.resolve<IRateLimitCounter>(
        InfrastructureTokens.RateLimitingManagementRateLimitCounter,
      ),
      provider.resolve<IRateLimitPolicy>(
        InfrastructureTokens.RateLimitingManagementRateLimitPolicy,
      ),
      provider.resolve<IRateLimitStatisticsProvider>(
        InfrastructureTokens.RateLimitingManagementRateLimitStatisticsProvider,
      ),
      provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
    ),
  );

  registry.registerTransient(
    InfrastructureTokens.RateLimitingManagementRegisterRateLimitRuleUseCase,
    (provider) =>
      new RegisterRateLimitRuleUseCase(
        provider.resolve<RateLimitingManagementService>(
          InfrastructureTokens.RateLimitingManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.RateLimitingManagementCheckRateLimitUseCase,
    (provider) =>
      new CheckRateLimitUseCase(
        provider.resolve<RateLimitingManagementService>(
          InfrastructureTokens.RateLimitingManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.RateLimitingManagementIncrementRateLimitCounterUseCase,
    (provider) =>
      new IncrementRateLimitCounterUseCase(
        provider.resolve<RateLimitingManagementService>(
          InfrastructureTokens.RateLimitingManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.RateLimitingManagementResetRateLimitCounterUseCase,
    (provider) =>
      new ResetRateLimitCounterUseCase(
        provider.resolve<RateLimitingManagementService>(
          InfrastructureTokens.RateLimitingManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.RateLimitingManagementDeleteRateLimitRuleUseCase,
    (provider) =>
      new DeleteRateLimitRuleUseCase(
        provider.resolve<RateLimitingManagementService>(
          InfrastructureTokens.RateLimitingManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.RateLimitingManagementGetRateLimitRuleUseCase,
    (provider) =>
      new GetRateLimitRuleUseCase(
        provider.resolve<RateLimitingManagementService>(
          InfrastructureTokens.RateLimitingManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.RateLimitingManagementListRateLimitRulesUseCase,
    (provider) =>
      new ListRateLimitRulesUseCase(
        provider.resolve<RateLimitingManagementService>(
          InfrastructureTokens.RateLimitingManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.RateLimitingManagementGetRateLimitStatisticsUseCase,
    (provider) =>
      new GetRateLimitStatisticsUseCase(
        provider.resolve<RateLimitingManagementService>(
          InfrastructureTokens.RateLimitingManagementService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.RateLimitingManagementApplicationService,
    (provider) =>
      new RateLimitingManagementApplicationService(
        provider.resolve<RegisterRateLimitRuleUseCase>(
          InfrastructureTokens.RateLimitingManagementRegisterRateLimitRuleUseCase,
        ),
        provider.resolve<CheckRateLimitUseCase>(
          InfrastructureTokens.RateLimitingManagementCheckRateLimitUseCase,
        ),
        provider.resolve<IncrementRateLimitCounterUseCase>(
          InfrastructureTokens.RateLimitingManagementIncrementRateLimitCounterUseCase,
        ),
        provider.resolve<ResetRateLimitCounterUseCase>(
          InfrastructureTokens.RateLimitingManagementResetRateLimitCounterUseCase,
        ),
        provider.resolve<DeleteRateLimitRuleUseCase>(
          InfrastructureTokens.RateLimitingManagementDeleteRateLimitRuleUseCase,
        ),
        provider.resolve<GetRateLimitRuleUseCase>(
          InfrastructureTokens.RateLimitingManagementGetRateLimitRuleUseCase,
        ),
        provider.resolve<ListRateLimitRulesUseCase>(
          InfrastructureTokens.RateLimitingManagementListRateLimitRulesUseCase,
        ),
        provider.resolve<GetRateLimitStatisticsUseCase>(
          InfrastructureTokens.RateLimitingManagementGetRateLimitStatisticsUseCase,
        ),
      ),
  );
}
