import type {
  CheckIdempotencyKeyInput,
  CheckIdempotencyKeyResult,
  CleanupExpiredKeysResult,
  ExpireIdempotencyKeyInput,
  ExpireIdempotencyKeyOutput,
  GetStoredOperationResultInput,
  GetStoredOperationResultOutput,
  IdempotencyRecord,
  RegisterIdempotencyKeyInput,
  StoreOperationResultInput,
  StoreOperationResultOutput,
} from "@server/application/idempotency-management/models/idempotency.model";
import type { IdempotencyManagementService } from "@server/application/idempotency-management/services/idempotency-management.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterIdempotencyKeyUseCase {
  constructor(private readonly idempotency: IdempotencyManagementService) {}

  execute(input: RegisterIdempotencyKeyInput): Promise<UseCaseResult<IdempotencyRecord>> {
    return this.idempotency.registerKey(input).then(useCaseResult);
  }
}

export class CheckIdempotencyKeyUseCase {
  constructor(private readonly idempotency: IdempotencyManagementService) {}

  execute(input: CheckIdempotencyKeyInput): Promise<UseCaseResult<CheckIdempotencyKeyResult>> {
    return this.idempotency.checkKey(input).then(useCaseResult);
  }
}

export class StoreOperationResultUseCase {
  constructor(private readonly idempotency: IdempotencyManagementService) {}

  execute(input: StoreOperationResultInput): Promise<UseCaseResult<StoreOperationResultOutput>> {
    return this.idempotency.storeResult(input).then(useCaseResult);
  }
}

export class GetStoredOperationResultUseCase {
  constructor(private readonly idempotency: IdempotencyManagementService) {}

  execute(
    input: GetStoredOperationResultInput,
  ): Promise<UseCaseResult<GetStoredOperationResultOutput>> {
    return this.idempotency.getStoredResult(input).then(useCaseResult);
  }
}

export class ExpireIdempotencyKeyUseCase {
  constructor(private readonly idempotency: IdempotencyManagementService) {}

  execute(input: ExpireIdempotencyKeyInput): Promise<UseCaseResult<ExpireIdempotencyKeyOutput>> {
    return this.idempotency.expireKey(input).then(useCaseResult);
  }
}

export class CleanupExpiredKeysUseCase {
  constructor(private readonly idempotency: IdempotencyManagementService) {}

  execute(): Promise<UseCaseResult<CleanupExpiredKeysResult>> {
    return this.idempotency.cleanupExpiredKeys().then(useCaseResult);
  }
}
