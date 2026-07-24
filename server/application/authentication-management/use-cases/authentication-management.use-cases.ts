import type {
  AuthSession,
  GetCurrentSessionInput,
  LoginInput,
  LoginResult,
  LogoutInput,
  LogoutResult,
  RefreshSessionInput,
  RefreshSessionResult,
  RevokeSessionInput,
  RevokeSessionResult,
  SessionValidationResult,
  ValidateSessionInput,
} from "@server/application/authentication-management/models/authentication.model";
import type { AuthenticationManagementService } from "@server/application/authentication-management/services/authentication-management.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class LoginUseCase {
  constructor(private readonly authentication: AuthenticationManagementService) {}

  execute(input: LoginInput): Promise<UseCaseResult<LoginResult>> {
    return this.authentication.login(input).then(useCaseResult);
  }
}

export class LogoutUseCase {
  constructor(private readonly authentication: AuthenticationManagementService) {}

  execute(input: LogoutInput): Promise<UseCaseResult<LogoutResult>> {
    return this.authentication.logout(input).then(useCaseResult);
  }
}

export class RefreshSessionUseCase {
  constructor(private readonly authentication: AuthenticationManagementService) {}

  execute(input: RefreshSessionInput): Promise<UseCaseResult<RefreshSessionResult>> {
    return this.authentication.refreshSession(input).then(useCaseResult);
  }
}

export class RevokeSessionUseCase {
  constructor(private readonly authentication: AuthenticationManagementService) {}

  execute(input: RevokeSessionInput): Promise<UseCaseResult<RevokeSessionResult>> {
    return this.authentication.revokeSession(input).then(useCaseResult);
  }
}

export class GetCurrentSessionUseCase {
  constructor(private readonly authentication: AuthenticationManagementService) {}

  async execute(input: GetCurrentSessionInput): Promise<UseCaseResult<AuthSession | null>> {
    return useCaseResult(await this.authentication.getCurrentSession(input));
  }
}

export class ValidateSessionUseCase {
  constructor(private readonly authentication: AuthenticationManagementService) {}

  execute(input: ValidateSessionInput): Promise<UseCaseResult<SessionValidationResult>> {
    return this.authentication.validateSession(input).then(useCaseResult);
  }
}
