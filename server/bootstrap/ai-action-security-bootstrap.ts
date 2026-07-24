import type { IAgentActionValidator } from "@server/application/ai-action-security/contracts/agent-action-validator.contract";
import type { ISecurityAuditRepository } from "@server/application/ai-action-security/contracts/security-audit-repository.contract";
import type { ISecurityDecisionEngine } from "@server/application/ai-action-security/contracts/security-decision-engine.contract";
import type { ISecurityPolicyRepository } from "@server/application/ai-action-security/contracts/security-policy-repository.contract";
import type { ISecurityStatisticsProvider } from "@server/application/ai-action-security/contracts/security-statistics-provider.contract";
import {
  AiActionSecurityApplicationService,
  AiActionSecurityService,
  DeleteSecurityPolicyUseCase,
  GetSecurityAuditHistoryUseCase,
  GetSecurityPolicyUseCase,
  GetSecurityStatisticsUseCase,
  ListSecurityPoliciesUseCase,
  RegisterSecurityPolicyUseCase,
  UpdateSecurityPolicyUseCase,
  ValidateAgentActionUseCase,
} from "@server/application/ai-action-security";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { DefaultAgentActionValidator } from "@server/infrastructure/ai-action-security/default-agent-action.validator";
import { DefaultSecurityDecisionEngine } from "@server/infrastructure/ai-action-security/default-security-decision.engine";
import { DefaultSecurityStatisticsProvider } from "@server/infrastructure/ai-action-security/default-security-statistics.provider";
import { SecurityAuditRepository } from "@server/infrastructure/ai-action-security/security-audit.repository";
import { SecurityPolicyRepository } from "@server/infrastructure/ai-action-security/security-policy.repository";

/** Registers AI Action Security services and use cases. */
export function registerAiActionSecurityApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiActionSecuritySecurityPolicyRepository,
    () => new SecurityPolicyRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiActionSecurityAgentActionValidator,
    () => new DefaultAgentActionValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiActionSecuritySecurityDecisionEngine,
    () => new DefaultSecurityDecisionEngine(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiActionSecuritySecurityAuditRepository,
    () => new SecurityAuditRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiActionSecuritySecurityStatisticsProvider,
    () => new DefaultSecurityStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiActionSecurityService,
    (provider) =>
      new AiActionSecurityService(
        provider.resolve<ISecurityPolicyRepository>(
          InfrastructureTokens.AiActionSecuritySecurityPolicyRepository,
        ),
        provider.resolve<IAgentActionValidator>(
          InfrastructureTokens.AiActionSecurityAgentActionValidator,
        ),
        provider.resolve<ISecurityDecisionEngine>(
          InfrastructureTokens.AiActionSecuritySecurityDecisionEngine,
        ),
        provider.resolve<ISecurityAuditRepository>(
          InfrastructureTokens.AiActionSecuritySecurityAuditRepository,
        ),
        provider.resolve<ISecurityStatisticsProvider>(
          InfrastructureTokens.AiActionSecuritySecurityStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiActionSecurityRegisterSecurityPolicyUseCase,
    (provider) =>
      new RegisterSecurityPolicyUseCase(
        provider.resolve<AiActionSecurityService>(InfrastructureTokens.AiActionSecurityService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiActionSecurityGetSecurityPolicyUseCase,
    (provider) =>
      new GetSecurityPolicyUseCase(
        provider.resolve<AiActionSecurityService>(InfrastructureTokens.AiActionSecurityService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiActionSecurityListSecurityPoliciesUseCase,
    (provider) =>
      new ListSecurityPoliciesUseCase(
        provider.resolve<AiActionSecurityService>(InfrastructureTokens.AiActionSecurityService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiActionSecurityUpdateSecurityPolicyUseCase,
    (provider) =>
      new UpdateSecurityPolicyUseCase(
        provider.resolve<AiActionSecurityService>(InfrastructureTokens.AiActionSecurityService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiActionSecurityDeleteSecurityPolicyUseCase,
    (provider) =>
      new DeleteSecurityPolicyUseCase(
        provider.resolve<AiActionSecurityService>(InfrastructureTokens.AiActionSecurityService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiActionSecurityValidateAgentActionUseCase,
    (provider) =>
      new ValidateAgentActionUseCase(
        provider.resolve<AiActionSecurityService>(InfrastructureTokens.AiActionSecurityService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiActionSecurityGetSecurityAuditHistoryUseCase,
    (provider) =>
      new GetSecurityAuditHistoryUseCase(
        provider.resolve<AiActionSecurityService>(InfrastructureTokens.AiActionSecurityService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiActionSecurityGetSecurityStatisticsUseCase,
    (provider) =>
      new GetSecurityStatisticsUseCase(
        provider.resolve<AiActionSecurityService>(InfrastructureTokens.AiActionSecurityService),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiActionSecurityApplicationService,
    (provider) =>
      new AiActionSecurityApplicationService(
        provider.resolve<RegisterSecurityPolicyUseCase>(
          InfrastructureTokens.AiActionSecurityRegisterSecurityPolicyUseCase,
        ),
        provider.resolve<GetSecurityPolicyUseCase>(
          InfrastructureTokens.AiActionSecurityGetSecurityPolicyUseCase,
        ),
        provider.resolve<ListSecurityPoliciesUseCase>(
          InfrastructureTokens.AiActionSecurityListSecurityPoliciesUseCase,
        ),
        provider.resolve<UpdateSecurityPolicyUseCase>(
          InfrastructureTokens.AiActionSecurityUpdateSecurityPolicyUseCase,
        ),
        provider.resolve<DeleteSecurityPolicyUseCase>(
          InfrastructureTokens.AiActionSecurityDeleteSecurityPolicyUseCase,
        ),
        provider.resolve<ValidateAgentActionUseCase>(
          InfrastructureTokens.AiActionSecurityValidateAgentActionUseCase,
        ),
        provider.resolve<GetSecurityAuditHistoryUseCase>(
          InfrastructureTokens.AiActionSecurityGetSecurityAuditHistoryUseCase,
        ),
        provider.resolve<GetSecurityStatisticsUseCase>(
          InfrastructureTokens.AiActionSecurityGetSecurityStatisticsUseCase,
        ),
      ),
  );
}
