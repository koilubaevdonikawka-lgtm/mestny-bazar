import type { IIdempotencyExpirationPolicy } from "@server/application/idempotency-management/contracts/idempotency-expiration-policy.contract";
import type { IIdempotencyKeyGenerator } from "@server/application/idempotency-management/contracts/idempotency-key-generator.contract";
import type { IIdempotencyRepository } from "@server/application/idempotency-management/contracts/idempotency-repository.contract";
import type { IIdempotencySerializer } from "@server/application/idempotency-management/contracts/idempotency-serializer.contract";
import type { IIdempotencyStorage } from "@server/application/idempotency-management/contracts/idempotency-storage.contract";
import {
  CheckIdempotencyKeyUseCase,
  CleanupExpiredKeysUseCase,
  ExpireIdempotencyKeyUseCase,
  GetStoredOperationResultUseCase,
  IdempotencyManagementApplicationService,
  IdempotencyManagementService,
  RegisterIdempotencyKeyUseCase,
  StoreOperationResultUseCase,
} from "@server/application/idempotency-management";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { DefaultIdempotencyExpirationPolicy } from "@server/infrastructure/idempotency-management/default-idempotency-expiration-policy";
import { DefaultIdempotencyKeyGenerator } from "@server/infrastructure/idempotency-management/default-idempotency-key-generator";
import { IdempotencyRepository } from "@server/infrastructure/idempotency-management/idempotency.repository";
import { InMemoryIdempotencyStorage } from "@server/infrastructure/idempotency-management/in-memory-idempotency.storage";
import { JsonIdempotencySerializer } from "@server/infrastructure/idempotency-management/json-idempotency.serializer";

/** Registers idempotency management services and use cases. */
export function registerIdempotencyManagementApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(InfrastructureTokens.IdempotencyManagementStorage, () =>
    new InMemoryIdempotencyStorage(),
  );

  registry.registerSingleton(InfrastructureTokens.IdempotencyManagementRepository, (provider) =>
    new IdempotencyRepository(
      provider.resolve<IIdempotencyStorage>(InfrastructureTokens.IdempotencyManagementStorage),
    ),
  );

  registry.registerSingleton(InfrastructureTokens.IdempotencyManagementKeyGenerator, () =>
    new DefaultIdempotencyKeyGenerator(),
  );

  registry.registerSingleton(InfrastructureTokens.IdempotencyManagementExpirationPolicy, () =>
    new DefaultIdempotencyExpirationPolicy(),
  );

  registry.registerSingleton(InfrastructureTokens.IdempotencyManagementSerializer, () =>
    new JsonIdempotencySerializer(),
  );

  registry.registerTransient(InfrastructureTokens.IdempotencyManagementService, (provider) =>
    new IdempotencyManagementService(
      provider.resolve<IIdempotencyRepository>(InfrastructureTokens.IdempotencyManagementRepository),
      provider.resolve<IIdempotencyKeyGenerator>(
        InfrastructureTokens.IdempotencyManagementKeyGenerator,
      ),
      provider.resolve<IIdempotencyExpirationPolicy>(
        InfrastructureTokens.IdempotencyManagementExpirationPolicy,
      ),
      provider.resolve<IIdempotencySerializer>(InfrastructureTokens.IdempotencyManagementSerializer),
    ),
  );

  registry.registerTransient(
    InfrastructureTokens.IdempotencyManagementRegisterIdempotencyKeyUseCase,
    (provider) =>
      new RegisterIdempotencyKeyUseCase(
        provider.resolve<IdempotencyManagementService>(
          InfrastructureTokens.IdempotencyManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.IdempotencyManagementCheckIdempotencyKeyUseCase,
    (provider) =>
      new CheckIdempotencyKeyUseCase(
        provider.resolve<IdempotencyManagementService>(
          InfrastructureTokens.IdempotencyManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.IdempotencyManagementStoreOperationResultUseCase,
    (provider) =>
      new StoreOperationResultUseCase(
        provider.resolve<IdempotencyManagementService>(
          InfrastructureTokens.IdempotencyManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.IdempotencyManagementGetStoredOperationResultUseCase,
    (provider) =>
      new GetStoredOperationResultUseCase(
        provider.resolve<IdempotencyManagementService>(
          InfrastructureTokens.IdempotencyManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.IdempotencyManagementExpireIdempotencyKeyUseCase,
    (provider) =>
      new ExpireIdempotencyKeyUseCase(
        provider.resolve<IdempotencyManagementService>(
          InfrastructureTokens.IdempotencyManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.IdempotencyManagementCleanupExpiredKeysUseCase,
    (provider) =>
      new CleanupExpiredKeysUseCase(
        provider.resolve<IdempotencyManagementService>(
          InfrastructureTokens.IdempotencyManagementService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.IdempotencyManagementApplicationService,
    (provider) =>
      new IdempotencyManagementApplicationService(
        provider.resolve<RegisterIdempotencyKeyUseCase>(
          InfrastructureTokens.IdempotencyManagementRegisterIdempotencyKeyUseCase,
        ),
        provider.resolve<CheckIdempotencyKeyUseCase>(
          InfrastructureTokens.IdempotencyManagementCheckIdempotencyKeyUseCase,
        ),
        provider.resolve<StoreOperationResultUseCase>(
          InfrastructureTokens.IdempotencyManagementStoreOperationResultUseCase,
        ),
        provider.resolve<GetStoredOperationResultUseCase>(
          InfrastructureTokens.IdempotencyManagementGetStoredOperationResultUseCase,
        ),
        provider.resolve<ExpireIdempotencyKeyUseCase>(
          InfrastructureTokens.IdempotencyManagementExpireIdempotencyKeyUseCase,
        ),
        provider.resolve<CleanupExpiredKeysUseCase>(
          InfrastructureTokens.IdempotencyManagementCleanupExpiredKeysUseCase,
        ),
      ),
  );
}
