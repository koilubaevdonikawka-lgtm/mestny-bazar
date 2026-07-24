import type { IAuthorizationAuditProvider } from "@server/application/authorization-management/contracts/authorization-audit-provider.contract";
import type { IAuthorizationPolicyRepository } from "@server/application/authorization-management/contracts/authorization-policy-repository.contract";
import type { IPermissionProvider } from "@server/application/authorization-management/contracts/permission-provider.contract";
import type { IResourceAccessProvider } from "@server/application/authorization-management/contracts/resource-access-provider.contract";
import type { IRoleProvider } from "@server/application/authorization-management/contracts/role-provider.contract";
import {
  AuthorizationManagementApplicationService,
  AuthorizationManagementService,
  AuthorizeActionUseCase,
  CheckPermissionUseCase,
  CheckResourceAccessUseCase,
  CheckRoleUseCase,
  GetEffectivePermissionsUseCase,
  RegisterAuthorizationPolicyUseCase,
} from "@server/application/authorization-management";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { AuthorizationPolicyRepository } from "@server/infrastructure/authorization-management/authorization-policy.repository";
import { DefaultPermissionProvider } from "@server/infrastructure/authorization-management/default-permission.provider";
import { DefaultResourceAccessProvider } from "@server/infrastructure/authorization-management/default-resource-access.provider";
import { DefaultRoleProvider } from "@server/infrastructure/authorization-management/default-role.provider";
import { NoopAuthorizationAuditProvider } from "@server/infrastructure/authorization-management/noop-authorization-audit.provider";

/** Registers authorization management services and use cases. */
export function registerAuthorizationManagementApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(InfrastructureTokens.AuthorizationManagementPolicyRepository, () =>
    new AuthorizationPolicyRepository(),
  );

  registry.registerSingleton(InfrastructureTokens.AuthorizationManagementPermissionProvider, () =>
    new DefaultPermissionProvider(),
  );

  registry.registerSingleton(InfrastructureTokens.AuthorizationManagementRoleProvider, () =>
    new DefaultRoleProvider(),
  );

  registry.registerSingleton(InfrastructureTokens.AuthorizationManagementResourceAccessProvider, () =>
    new DefaultResourceAccessProvider(),
  );

  registry.registerSingleton(InfrastructureTokens.AuthorizationManagementAuditProvider, () =>
    new NoopAuthorizationAuditProvider(),
  );

  registry.registerTransient(InfrastructureTokens.AuthorizationManagementService, (provider) =>
    new AuthorizationManagementService(
      provider.resolve<IAuthorizationPolicyRepository>(
        InfrastructureTokens.AuthorizationManagementPolicyRepository,
      ),
      provider.resolve<IPermissionProvider>(
        InfrastructureTokens.AuthorizationManagementPermissionProvider,
      ),
      provider.resolve<IRoleProvider>(InfrastructureTokens.AuthorizationManagementRoleProvider),
      provider.resolve<IResourceAccessProvider>(
        InfrastructureTokens.AuthorizationManagementResourceAccessProvider,
      ),
      provider.resolve<IAuthorizationAuditProvider>(
        InfrastructureTokens.AuthorizationManagementAuditProvider,
      ),
      provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
    ),
  );

  registry.registerTransient(
    InfrastructureTokens.AuthorizationManagementAuthorizeActionUseCase,
    (provider) =>
      new AuthorizeActionUseCase(
        provider.resolve<AuthorizationManagementService>(
          InfrastructureTokens.AuthorizationManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AuthorizationManagementCheckRoleUseCase,
    (provider) =>
      new CheckRoleUseCase(
        provider.resolve<AuthorizationManagementService>(
          InfrastructureTokens.AuthorizationManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AuthorizationManagementCheckPermissionUseCase,
    (provider) =>
      new CheckPermissionUseCase(
        provider.resolve<AuthorizationManagementService>(
          InfrastructureTokens.AuthorizationManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AuthorizationManagementCheckResourceAccessUseCase,
    (provider) =>
      new CheckResourceAccessUseCase(
        provider.resolve<AuthorizationManagementService>(
          InfrastructureTokens.AuthorizationManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AuthorizationManagementGetEffectivePermissionsUseCase,
    (provider) =>
      new GetEffectivePermissionsUseCase(
        provider.resolve<AuthorizationManagementService>(
          InfrastructureTokens.AuthorizationManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AuthorizationManagementRegisterAuthorizationPolicyUseCase,
    (provider) =>
      new RegisterAuthorizationPolicyUseCase(
        provider.resolve<AuthorizationManagementService>(
          InfrastructureTokens.AuthorizationManagementService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AuthorizationManagementApplicationService,
    (provider) =>
      new AuthorizationManagementApplicationService(
        provider.resolve<AuthorizeActionUseCase>(
          InfrastructureTokens.AuthorizationManagementAuthorizeActionUseCase,
        ),
        provider.resolve<CheckRoleUseCase>(
          InfrastructureTokens.AuthorizationManagementCheckRoleUseCase,
        ),
        provider.resolve<CheckPermissionUseCase>(
          InfrastructureTokens.AuthorizationManagementCheckPermissionUseCase,
        ),
        provider.resolve<CheckResourceAccessUseCase>(
          InfrastructureTokens.AuthorizationManagementCheckResourceAccessUseCase,
        ),
        provider.resolve<GetEffectivePermissionsUseCase>(
          InfrastructureTokens.AuthorizationManagementGetEffectivePermissionsUseCase,
        ),
        provider.resolve<RegisterAuthorizationPolicyUseCase>(
          InfrastructureTokens.AuthorizationManagementRegisterAuthorizationPolicyUseCase,
        ),
      ),
  );
}
