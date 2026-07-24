import type {
  AuthorizeActionInput,
  AuthenticatedUser,
  CheckPermissionInput,
  CheckResourceAccessInput,
  CheckRoleInput,
  RegisterAuthorizationPolicyInput,
} from "@server/application/authorization-management/models/authorization.model";
import {
  AuthorizeActionUseCase,
  CheckPermissionUseCase,
  CheckResourceAccessUseCase,
  CheckRoleUseCase,
  GetEffectivePermissionsUseCase,
  RegisterAuthorizationPolicyUseCase,
} from "@server/application/authorization-management/use-cases/authorization-management.use-cases";

/** Application facade for authorization management scenario. */
export class AuthorizationManagementApplicationService {
  constructor(
    private readonly authorizeActionUseCase: AuthorizeActionUseCase,
    private readonly checkRoleUseCase: CheckRoleUseCase,
    private readonly checkPermissionUseCase: CheckPermissionUseCase,
    private readonly checkResourceAccessUseCase: CheckResourceAccessUseCase,
    private readonly getEffectivePermissionsUseCase: GetEffectivePermissionsUseCase,
    private readonly registerAuthorizationPolicyUseCase: RegisterAuthorizationPolicyUseCase,
  ) {}

  authorizeAction(input: AuthorizeActionInput) {
    return this.authorizeActionUseCase.execute(input);
  }

  checkRole(input: CheckRoleInput) {
    return this.checkRoleUseCase.execute(input);
  }

  checkPermission(input: CheckPermissionInput) {
    return this.checkPermissionUseCase.execute(input);
  }

  checkResourceAccess(input: CheckResourceAccessInput) {
    return this.checkResourceAccessUseCase.execute(input);
  }

  getEffectivePermissions(userId: string, user?: AuthenticatedUser) {
    return this.getEffectivePermissionsUseCase.execute(userId, user);
  }

  registerPolicy(input: RegisterAuthorizationPolicyInput) {
    return this.registerAuthorizationPolicyUseCase.execute(input);
  }
}
