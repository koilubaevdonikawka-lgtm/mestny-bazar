import type { IMemoryCatalog } from "@server/application/ai-memory-management/contracts/memory-catalog.contract";
import type { IMemoryRepository } from "@server/application/ai-memory-management/contracts/memory-repository.contract";
import type { IMemorySerializer } from "@server/application/ai-memory-management/contracts/memory-serializer.contract";
import type { IMemoryStatisticsProvider } from "@server/application/ai-memory-management/contracts/memory-statistics-provider.contract";
import type { IMemoryValidator } from "@server/application/ai-memory-management/contracts/memory-validator.contract";
import {
  AiMemoryManagementApplicationService,
  AiMemoryManagementService,
  DeleteMemoryRecordUseCase,
  FindMemoryRecordsByKeyUseCase,
  GetMemoryRecordUseCase,
  GetMemoryStatisticsUseCase,
  ListMemoryRecordsByCategoryUseCase,
  ListMemoryRecordsUseCase,
  RegisterMemoryRecordUseCase,
  UpdateMemoryRecordUseCase,
} from "@server/application/ai-memory-management";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { DefaultMemoryCatalog } from "@server/infrastructure/ai-memory-management/default-memory.catalog";
import { DefaultMemoryStatisticsProvider } from "@server/infrastructure/ai-memory-management/default-memory-statistics.provider";
import { DefaultMemoryValidator } from "@server/infrastructure/ai-memory-management/default-memory.validator";
import { JsonMemorySerializer } from "@server/infrastructure/ai-memory-management/json-memory.serializer";
import { MemoryRepository } from "@server/infrastructure/ai-memory-management/memory.repository";

/** Registers AI Memory Management services and use cases. */
export function registerAiMemoryManagementApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiMemoryManagementMemoryRepository,
    () => new MemoryRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiMemoryManagementMemoryCatalog,
    () => new DefaultMemoryCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiMemoryManagementMemoryValidator,
    () => new DefaultMemoryValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiMemoryManagementMemorySerializer,
    () => new JsonMemorySerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiMemoryManagementMemoryStatisticsProvider,
    () => new DefaultMemoryStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiMemoryManagementService,
    (provider) =>
      new AiMemoryManagementService(
        provider.resolve<IMemoryRepository>(
          InfrastructureTokens.AiMemoryManagementMemoryRepository,
        ),
        provider.resolve<IMemoryCatalog>(
          InfrastructureTokens.AiMemoryManagementMemoryCatalog,
        ),
        provider.resolve<IMemoryValidator>(
          InfrastructureTokens.AiMemoryManagementMemoryValidator,
        ),
        provider.resolve<IMemorySerializer>(
          InfrastructureTokens.AiMemoryManagementMemorySerializer,
        ),
        provider.resolve<IMemoryStatisticsProvider>(
          InfrastructureTokens.AiMemoryManagementMemoryStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiMemoryManagementRegisterMemoryRecordUseCase,
    (provider) =>
      new RegisterMemoryRecordUseCase(
        provider.resolve<AiMemoryManagementService>(InfrastructureTokens.AiMemoryManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiMemoryManagementGetMemoryRecordUseCase,
    (provider) =>
      new GetMemoryRecordUseCase(
        provider.resolve<AiMemoryManagementService>(InfrastructureTokens.AiMemoryManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiMemoryManagementListMemoryRecordsUseCase,
    (provider) =>
      new ListMemoryRecordsUseCase(
        provider.resolve<AiMemoryManagementService>(InfrastructureTokens.AiMemoryManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiMemoryManagementUpdateMemoryRecordUseCase,
    (provider) =>
      new UpdateMemoryRecordUseCase(
        provider.resolve<AiMemoryManagementService>(InfrastructureTokens.AiMemoryManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiMemoryManagementDeleteMemoryRecordUseCase,
    (provider) =>
      new DeleteMemoryRecordUseCase(
        provider.resolve<AiMemoryManagementService>(InfrastructureTokens.AiMemoryManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiMemoryManagementFindMemoryRecordsByKeyUseCase,
    (provider) =>
      new FindMemoryRecordsByKeyUseCase(
        provider.resolve<AiMemoryManagementService>(InfrastructureTokens.AiMemoryManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiMemoryManagementListMemoryRecordsByCategoryUseCase,
    (provider) =>
      new ListMemoryRecordsByCategoryUseCase(
        provider.resolve<AiMemoryManagementService>(InfrastructureTokens.AiMemoryManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiMemoryManagementGetMemoryStatisticsUseCase,
    (provider) =>
      new GetMemoryStatisticsUseCase(
        provider.resolve<AiMemoryManagementService>(InfrastructureTokens.AiMemoryManagementService),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiMemoryManagementApplicationService,
    (provider) =>
      new AiMemoryManagementApplicationService(
        provider.resolve<RegisterMemoryRecordUseCase>(
          InfrastructureTokens.AiMemoryManagementRegisterMemoryRecordUseCase,
        ),
        provider.resolve<GetMemoryRecordUseCase>(
          InfrastructureTokens.AiMemoryManagementGetMemoryRecordUseCase,
        ),
        provider.resolve<ListMemoryRecordsUseCase>(
          InfrastructureTokens.AiMemoryManagementListMemoryRecordsUseCase,
        ),
        provider.resolve<UpdateMemoryRecordUseCase>(
          InfrastructureTokens.AiMemoryManagementUpdateMemoryRecordUseCase,
        ),
        provider.resolve<DeleteMemoryRecordUseCase>(
          InfrastructureTokens.AiMemoryManagementDeleteMemoryRecordUseCase,
        ),
        provider.resolve<FindMemoryRecordsByKeyUseCase>(
          InfrastructureTokens.AiMemoryManagementFindMemoryRecordsByKeyUseCase,
        ),
        provider.resolve<ListMemoryRecordsByCategoryUseCase>(
          InfrastructureTokens.AiMemoryManagementListMemoryRecordsByCategoryUseCase,
        ),
        provider.resolve<GetMemoryStatisticsUseCase>(
          InfrastructureTokens.AiMemoryManagementGetMemoryStatisticsUseCase,
        ),
      ),
  );
}
