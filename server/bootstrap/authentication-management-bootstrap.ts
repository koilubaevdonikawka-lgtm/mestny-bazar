import type { IAuthenticationAuditProvider } from "@server/application/authentication-management/contracts/authentication-audit-provider.contract";
import type { IAuthenticationProvider } from "@server/application/authentication-management/contracts/authentication-provider.contract";
import type { ISessionRepository } from "@server/application/authentication-management/contracts/session-repository.contract";
import type { ITokenProvider } from "@server/application/authentication-management/contracts/token-provider.contract";
import type { IPasswordVerifier } from "@server/application/authentication-management/contracts/password-verifier.contract";
import {
  AuthenticationManagementApplicationService,
  AuthenticationManagementService,
  GetCurrentSessionUseCase,
  LoginUseCase,
  LogoutUseCase,
  RefreshSessionUseCase,
  RevokeSessionUseCase,
  ValidateSessionUseCase,
} from "@server/application/authentication-management";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { DefaultPasswordVerifier } from "@server/infrastructure/authentication-management/default-password-verifier";
import { LocalAuthenticationProvider } from "@server/infrastructure/authentication-management/local-authentication.provider";
import { NoopAuthenticationAuditProvider } from "@server/infrastructure/authentication-management/noop-authentication-audit.provider";
import { OpaqueTokenProvider } from "@server/infrastructure/authentication-management/opaque-token.provider";
import { SessionRepository } from "@server/infrastructure/authentication-management/session.repository";

/** Registers authentication management services and use cases. */
export function registerAuthenticationManagementApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(InfrastructureTokens.AuthenticationManagementPasswordVerifier, () =>
    new DefaultPasswordVerifier(),
  );

  registry.registerSingleton(InfrastructureTokens.AuthenticationManagementSessionRepository, () =>
    new SessionRepository(),
  );

  registry.registerSingleton(InfrastructureTokens.AuthenticationManagementTokenProvider, () =>
    new OpaqueTokenProvider(),
  );

  registry.registerSingleton(InfrastructureTokens.AuthenticationManagementAuditProvider, () =>
    new NoopAuthenticationAuditProvider(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AuthenticationManagementProvider,
    (provider) =>
      new LocalAuthenticationProvider(
        provider.resolve<IPasswordVerifier>(
          InfrastructureTokens.AuthenticationManagementPasswordVerifier,
        ),
      ),
  );

  registry.registerTransient(InfrastructureTokens.AuthenticationManagementService, (provider) =>
    new AuthenticationManagementService(
      provider.resolve<IAuthenticationProvider>(
        InfrastructureTokens.AuthenticationManagementProvider,
      ),
      provider.resolve<ISessionRepository>(
        InfrastructureTokens.AuthenticationManagementSessionRepository,
      ),
      provider.resolve<ITokenProvider>(InfrastructureTokens.AuthenticationManagementTokenProvider),
      provider.resolve<IAuthenticationAuditProvider>(
        InfrastructureTokens.AuthenticationManagementAuditProvider,
      ),
      provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
    ),
  );

  registry.registerTransient(InfrastructureTokens.AuthenticationManagementLoginUseCase, (provider) =>
    new LoginUseCase(
      provider.resolve<AuthenticationManagementService>(
        InfrastructureTokens.AuthenticationManagementService,
      ),
    ),
  );
  registry.registerTransient(
    InfrastructureTokens.AuthenticationManagementLogoutUseCase,
    (provider) =>
      new LogoutUseCase(
        provider.resolve<AuthenticationManagementService>(
          InfrastructureTokens.AuthenticationManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AuthenticationManagementRefreshSessionUseCase,
    (provider) =>
      new RefreshSessionUseCase(
        provider.resolve<AuthenticationManagementService>(
          InfrastructureTokens.AuthenticationManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AuthenticationManagementRevokeSessionUseCase,
    (provider) =>
      new RevokeSessionUseCase(
        provider.resolve<AuthenticationManagementService>(
          InfrastructureTokens.AuthenticationManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AuthenticationManagementGetCurrentSessionUseCase,
    (provider) =>
      new GetCurrentSessionUseCase(
        provider.resolve<AuthenticationManagementService>(
          InfrastructureTokens.AuthenticationManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AuthenticationManagementValidateSessionUseCase,
    (provider) =>
      new ValidateSessionUseCase(
        provider.resolve<AuthenticationManagementService>(
          InfrastructureTokens.AuthenticationManagementService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AuthenticationManagementApplicationService,
    (provider) =>
      new AuthenticationManagementApplicationService(
        provider.resolve<LoginUseCase>(InfrastructureTokens.AuthenticationManagementLoginUseCase),
        provider.resolve<LogoutUseCase>(InfrastructureTokens.AuthenticationManagementLogoutUseCase),
        provider.resolve<RefreshSessionUseCase>(
          InfrastructureTokens.AuthenticationManagementRefreshSessionUseCase,
        ),
        provider.resolve<RevokeSessionUseCase>(
          InfrastructureTokens.AuthenticationManagementRevokeSessionUseCase,
        ),
        provider.resolve<GetCurrentSessionUseCase>(
          InfrastructureTokens.AuthenticationManagementGetCurrentSessionUseCase,
        ),
        provider.resolve<ValidateSessionUseCase>(
          InfrastructureTokens.AuthenticationManagementValidateSessionUseCase,
        ),
      ),
  );
}
