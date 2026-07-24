import type {
  AuthorizationDecision,
  AuthorizationPolicy,
  AuthorizeActionInput,
  AuthenticatedUser,
  CheckPermissionInput,
  CheckResourceAccessInput,
  CheckRoleInput,
  EffectivePermissionsResult,
  RegisterAuthorizationPolicyInput,
} from "@server/application/authorization-management/models/authorization.model";
import type { AuthorizationManagementService } from "@server/application/authorization-management/services/authorization-management.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class AuthorizeActionUseCase {
  constructor(private readonly authorization: AuthorizationManagementService) {}

  execute(input: AuthorizeActionInput): Promise<UseCaseResult<AuthorizationDecision>> {
    return this.authorization.authorizeAction(input).then(useCaseResult);
  }
}

export class CheckRoleUseCase {
  constructor(private readonly authorization: AuthorizationManagementService) {}

  execute(input: CheckRoleInput): Promise<UseCaseResult<AuthorizationDecision>> {
    return this.authorization.checkRole(input).then(useCaseResult);
  }
}

export class CheckPermissionUseCase {
  constructor(private readonly authorization: AuthorizationManagementService) {}

  execute(input: CheckPermissionInput): Promise<UseCaseResult<AuthorizationDecision>> {
    return this.authorization.checkPermission(input).then(useCaseResult);
  }
}

export class CheckResourceAccessUseCase {
  constructor(private readonly authorization: AuthorizationManagementService) {}

  execute(input: CheckResourceAccessInput): Promise<UseCaseResult<AuthorizationDecision>> {
    return this.authorization.checkResourceAccess(input).then(useCaseResult);
  }
}

export class GetEffectivePermissionsUseCase {
  constructor(private readonly authorization: AuthorizationManagementService) {}

  execute(
    userId: string,
    user?: AuthenticatedUser,
  ): Promise<UseCaseResult<EffectivePermissionsResult>> {
    return this.authorization.getEffectivePermissions(userId, user).then(useCaseResult);
  }
}

export class RegisterAuthorizationPolicyUseCase {
  constructor(private readonly authorization: AuthorizationManagementService) {}

  execute(
    input: RegisterAuthorizationPolicyInput,
  ): Promise<UseCaseResult<AuthorizationPolicy>> {
    return this.authorization.registerPolicy(input).then(useCaseResult);
  }
}
