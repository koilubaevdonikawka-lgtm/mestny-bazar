export type { IAuthorizationPolicyRepository } from "./contracts/authorization-policy-repository.contract";
export type { IPermissionProvider } from "./contracts/permission-provider.contract";
export type { IRoleProvider } from "./contracts/role-provider.contract";
export type { IResourceAccessProvider } from "./contracts/resource-access-provider.contract";
export type {
  IAuthorizationAuditProvider,
  AuthorizationAuditRecord,
} from "./contracts/authorization-audit-provider.contract";
export type {
  IRbacEngine,
  IAbacEngine,
  IPolicyEngine,
  IPermissionCache,
  IOrganizationHierarchy,
  IExternalIdentityProvider,
} from "./contracts/authorization-extension-ports.contract";
export {
  createAuthorizationPolicy,
  createAuthorizationDecision,
} from "./models/authorization.model";
export type {
  AuthenticatedUser,
  AuthorizationPolicy,
  AuthorizationDecision,
  AuthorizeActionInput,
  CheckRoleInput,
  CheckPermissionInput,
  CheckResourceAccessInput,
  EffectivePermissionsResult,
  RegisterAuthorizationPolicyInput,
} from "./models/authorization.model";
export { AuthorizationManagementService } from "./services/authorization-management.service";
export { AuthorizationManagementApplicationService } from "./services/authorization-management-application.service";
export {
  AuthorizeActionUseCase,
  CheckRoleUseCase,
  CheckPermissionUseCase,
  CheckResourceAccessUseCase,
  GetEffectivePermissionsUseCase,
  RegisterAuthorizationPolicyUseCase,
} from "./use-cases/authorization-management.use-cases";
