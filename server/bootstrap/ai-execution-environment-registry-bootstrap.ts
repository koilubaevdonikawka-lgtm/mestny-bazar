import type { IExecutionEnvironmentCatalog } from "@server/application/ai-execution-environment-registry/contracts/execution-environment-catalog.contract";
import type { IExecutionEnvironmentRepository } from "@server/application/ai-execution-environment-registry/contracts/execution-environment-repository.contract";
import type { IExecutionEnvironmentSerializer } from "@server/application/ai-execution-environment-registry/contracts/execution-environment-serializer.contract";
import type { IExecutionEnvironmentStatisticsProvider } from "@server/application/ai-execution-environment-registry/contracts/execution-environment-statistics-provider.contract";
import type { IExecutionEnvironmentValidator } from "@server/application/ai-execution-environment-registry/contracts/execution-environment-validator.contract";
import {
  AiExecutionEnvironmentRegistryApplicationService,
  AiExecutionEnvironmentRegistryService,
  DeleteExecutionEnvironmentUseCase,
  FindExecutionEnvironmentByNameUseCase,
  GetExecutionEnvironmentRegistryStatisticsUseCase,
  GetExecutionEnvironmentUseCase,
  ListExecutionEnvironmentsByCategoryUseCase,
  ListExecutionEnvironmentsUseCase,
  RegisterExecutionEnvironmentUseCase,
  UpdateExecutionEnvironmentUseCase,
} from "@server/application/ai-execution-environment-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { ExecutionEnvironmentRepository } from "@server/infrastructure/ai-execution-environment-registry/execution-environment.repository";
import { DefaultExecutionEnvironmentCatalog } from "@server/infrastructure/ai-execution-environment-registry/default-execution-environment.catalog";
import { DefaultExecutionEnvironmentStatisticsProvider } from "@server/infrastructure/ai-execution-environment-registry/default-execution-environment-statistics.provider";
import { DefaultExecutionEnvironmentValidator } from "@server/infrastructure/ai-execution-environment-registry/default-execution-environment.validator";
import { JsonExecutionEnvironmentSerializer } from "@server/infrastructure/ai-execution-environment-registry/json-execution-environment.serializer";

/** Registers AI Execution Environment Registry services and use cases. */
export function registerAiExecutionEnvironmentRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiExecutionEnvironmentRegistryExecutionEnvironmentRepository,
    () => new ExecutionEnvironmentRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiExecutionEnvironmentRegistryExecutionEnvironmentCatalog,
    () => new DefaultExecutionEnvironmentCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiExecutionEnvironmentRegistryExecutionEnvironmentValidator,
    () => new DefaultExecutionEnvironmentValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiExecutionEnvironmentRegistryExecutionEnvironmentSerializer,
    () => new JsonExecutionEnvironmentSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiExecutionEnvironmentRegistryExecutionEnvironmentStatisticsProvider,
    () => new DefaultExecutionEnvironmentStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiExecutionEnvironmentRegistryService,
    (provider) =>
      new AiExecutionEnvironmentRegistryService(
        provider.resolve<IExecutionEnvironmentRepository>(
          InfrastructureTokens.AiExecutionEnvironmentRegistryExecutionEnvironmentRepository,
        ),
        provider.resolve<IExecutionEnvironmentCatalog>(
          InfrastructureTokens.AiExecutionEnvironmentRegistryExecutionEnvironmentCatalog,
        ),
        provider.resolve<IExecutionEnvironmentValidator>(
          InfrastructureTokens.AiExecutionEnvironmentRegistryExecutionEnvironmentValidator,
        ),
        provider.resolve<IExecutionEnvironmentSerializer>(
          InfrastructureTokens.AiExecutionEnvironmentRegistryExecutionEnvironmentSerializer,
        ),
        provider.resolve<IExecutionEnvironmentStatisticsProvider>(
          InfrastructureTokens.AiExecutionEnvironmentRegistryExecutionEnvironmentStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiExecutionEnvironmentRegistryRegisterExecutionEnvironmentUseCase,
    (provider) =>
      new RegisterExecutionEnvironmentUseCase(
        provider.resolve<AiExecutionEnvironmentRegistryService>(
          InfrastructureTokens.AiExecutionEnvironmentRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiExecutionEnvironmentRegistryGetExecutionEnvironmentUseCase,
    (provider) =>
      new GetExecutionEnvironmentUseCase(
        provider.resolve<AiExecutionEnvironmentRegistryService>(
          InfrastructureTokens.AiExecutionEnvironmentRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiExecutionEnvironmentRegistryListExecutionEnvironmentsUseCase,
    (provider) =>
      new ListExecutionEnvironmentsUseCase(
        provider.resolve<AiExecutionEnvironmentRegistryService>(
          InfrastructureTokens.AiExecutionEnvironmentRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiExecutionEnvironmentRegistryUpdateExecutionEnvironmentUseCase,
    (provider) =>
      new UpdateExecutionEnvironmentUseCase(
        provider.resolve<AiExecutionEnvironmentRegistryService>(
          InfrastructureTokens.AiExecutionEnvironmentRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiExecutionEnvironmentRegistryDeleteExecutionEnvironmentUseCase,
    (provider) =>
      new DeleteExecutionEnvironmentUseCase(
        provider.resolve<AiExecutionEnvironmentRegistryService>(
          InfrastructureTokens.AiExecutionEnvironmentRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiExecutionEnvironmentRegistryFindExecutionEnvironmentByNameUseCase,
    (provider) =>
      new FindExecutionEnvironmentByNameUseCase(
        provider.resolve<AiExecutionEnvironmentRegistryService>(
          InfrastructureTokens.AiExecutionEnvironmentRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiExecutionEnvironmentRegistryListExecutionEnvironmentsByCategoryUseCase,
    (provider) =>
      new ListExecutionEnvironmentsByCategoryUseCase(
        provider.resolve<AiExecutionEnvironmentRegistryService>(
          InfrastructureTokens.AiExecutionEnvironmentRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiExecutionEnvironmentRegistryGetExecutionEnvironmentRegistryStatisticsUseCase,
    (provider) =>
      new GetExecutionEnvironmentRegistryStatisticsUseCase(
        provider.resolve<AiExecutionEnvironmentRegistryService>(
          InfrastructureTokens.AiExecutionEnvironmentRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiExecutionEnvironmentRegistryApplicationService,
    (provider) =>
      new AiExecutionEnvironmentRegistryApplicationService(
        provider.resolve<RegisterExecutionEnvironmentUseCase>(
          InfrastructureTokens.AiExecutionEnvironmentRegistryRegisterExecutionEnvironmentUseCase,
        ),
        provider.resolve<GetExecutionEnvironmentUseCase>(
          InfrastructureTokens.AiExecutionEnvironmentRegistryGetExecutionEnvironmentUseCase,
        ),
        provider.resolve<ListExecutionEnvironmentsUseCase>(
          InfrastructureTokens.AiExecutionEnvironmentRegistryListExecutionEnvironmentsUseCase,
        ),
        provider.resolve<UpdateExecutionEnvironmentUseCase>(
          InfrastructureTokens.AiExecutionEnvironmentRegistryUpdateExecutionEnvironmentUseCase,
        ),
        provider.resolve<DeleteExecutionEnvironmentUseCase>(
          InfrastructureTokens.AiExecutionEnvironmentRegistryDeleteExecutionEnvironmentUseCase,
        ),
        provider.resolve<FindExecutionEnvironmentByNameUseCase>(
          InfrastructureTokens.AiExecutionEnvironmentRegistryFindExecutionEnvironmentByNameUseCase,
        ),
        provider.resolve<ListExecutionEnvironmentsByCategoryUseCase>(
          InfrastructureTokens.AiExecutionEnvironmentRegistryListExecutionEnvironmentsByCategoryUseCase,
        ),
        provider.resolve<GetExecutionEnvironmentRegistryStatisticsUseCase>(
          InfrastructureTokens.AiExecutionEnvironmentRegistryGetExecutionEnvironmentRegistryStatisticsUseCase,
        ),
      ),
  );
}
