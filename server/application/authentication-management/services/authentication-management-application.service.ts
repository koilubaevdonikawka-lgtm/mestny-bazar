import type {
  GetCurrentSessionInput,
  LoginInput,
  LogoutInput,
  RefreshSessionInput,
  RevokeSessionInput,
  ValidateSessionInput,
} from "@server/application/authentication-management/models/authentication.model";
import {
  GetCurrentSessionUseCase,
  LoginUseCase,
  LogoutUseCase,
  RefreshSessionUseCase,
  RevokeSessionUseCase,
  ValidateSessionUseCase,
} from "@server/application/authentication-management/use-cases/authentication-management.use-cases";

/** Application facade for authentication management scenario. */
export class AuthenticationManagementApplicationService {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly refreshSessionUseCase: RefreshSessionUseCase,
    private readonly revokeSessionUseCase: RevokeSessionUseCase,
    private readonly getCurrentSessionUseCase: GetCurrentSessionUseCase,
    private readonly validateSessionUseCase: ValidateSessionUseCase,
  ) {}

  login(input: LoginInput) {
    return this.loginUseCase.execute(input);
  }

  logout(input: LogoutInput) {
    return this.logoutUseCase.execute(input);
  }

  refreshSession(input: RefreshSessionInput) {
    return this.refreshSessionUseCase.execute(input);
  }

  revokeSession(input: RevokeSessionInput) {
    return this.revokeSessionUseCase.execute(input);
  }

  getCurrentSession(input: GetCurrentSessionInput) {
    return this.getCurrentSessionUseCase.execute(input);
  }

  validateSession(input: ValidateSessionInput) {
    return this.validateSessionUseCase.execute(input);
  }
}
