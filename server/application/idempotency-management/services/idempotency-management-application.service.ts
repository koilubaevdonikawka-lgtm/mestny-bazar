import type {
  CheckIdempotencyKeyInput,
  ExpireIdempotencyKeyInput,
  GetStoredOperationResultInput,
  RegisterIdempotencyKeyInput,
  StoreOperationResultInput,
} from "@server/application/idempotency-management/models/idempotency.model";
import {
  CheckIdempotencyKeyUseCase,
  CleanupExpiredKeysUseCase,
  ExpireIdempotencyKeyUseCase,
  GetStoredOperationResultUseCase,
  RegisterIdempotencyKeyUseCase,
  StoreOperationResultUseCase,
} from "@server/application/idempotency-management/use-cases/idempotency-management.use-cases";

/** Application facade for idempotency management scenario. */
export class IdempotencyManagementApplicationService {
  constructor(
    private readonly registerIdempotencyKeyUseCase: RegisterIdempotencyKeyUseCase,
    private readonly checkIdempotencyKeyUseCase: CheckIdempotencyKeyUseCase,
    private readonly storeOperationResultUseCase: StoreOperationResultUseCase,
    private readonly getStoredOperationResultUseCase: GetStoredOperationResultUseCase,
    private readonly expireIdempotencyKeyUseCase: ExpireIdempotencyKeyUseCase,
    private readonly cleanupExpiredKeysUseCase: CleanupExpiredKeysUseCase,
  ) {}

  registerKey(input: RegisterIdempotencyKeyInput) {
    return this.registerIdempotencyKeyUseCase.execute(input);
  }

  checkKey(input: CheckIdempotencyKeyInput) {
    return this.checkIdempotencyKeyUseCase.execute(input);
  }

  storeResult(input: StoreOperationResultInput) {
    return this.storeOperationResultUseCase.execute(input);
  }

  getStoredResult(input: GetStoredOperationResultInput) {
    return this.getStoredOperationResultUseCase.execute(input);
  }

  expireKey(input: ExpireIdempotencyKeyInput) {
    return this.expireIdempotencyKeyUseCase.execute(input);
  }

  cleanupExpiredKeys() {
    return this.cleanupExpiredKeysUseCase.execute();
  }
}
