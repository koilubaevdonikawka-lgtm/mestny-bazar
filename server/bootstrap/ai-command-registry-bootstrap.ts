import type { ICommandCatalog } from "@server/application/ai-command-registry/contracts/command-catalog.contract";
import type { ICommandRepository } from "@server/application/ai-command-registry/contracts/command-repository.contract";
import type { ICommandSerializer } from "@server/application/ai-command-registry/contracts/command-serializer.contract";
import type { ICommandStatisticsProvider } from "@server/application/ai-command-registry/contracts/command-statistics-provider.contract";
import type { ICommandValidator } from "@server/application/ai-command-registry/contracts/command-validator.contract";
import {
  AiCommandRegistryApplicationService,
  AiCommandRegistryService,
  DeleteCommandUseCase,
  FindCommandByNameUseCase,
  GetCommandRegistryStatisticsUseCase,
  GetCommandUseCase,
  ListCommandsByCategoryUseCase,
  ListCommandsUseCase,
  RegisterCommandUseCase,
  UpdateCommandUseCase,
} from "@server/application/ai-command-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { CommandRepository } from "@server/infrastructure/ai-command-registry/command.repository";
import { DefaultCommandCatalog } from "@server/infrastructure/ai-command-registry/default-command.catalog";
import { DefaultCommandStatisticsProvider } from "@server/infrastructure/ai-command-registry/default-command-statistics.provider";
import { DefaultCommandValidator } from "@server/infrastructure/ai-command-registry/default-command.validator";
import { JsonCommandSerializer } from "@server/infrastructure/ai-command-registry/json-command.serializer";

/** Registers AI Command Registry services and use cases. */
export function registerAiCommandRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiCommandRegistryCommandRepository,
    () => new CommandRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiCommandRegistryCommandCatalog,
    () => new DefaultCommandCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiCommandRegistryCommandValidator,
    () => new DefaultCommandValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiCommandRegistryCommandSerializer,
    () => new JsonCommandSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiCommandRegistryCommandStatisticsProvider,
    () => new DefaultCommandStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiCommandRegistryService,
    (provider) =>
      new AiCommandRegistryService(
        provider.resolve<ICommandRepository>(
          InfrastructureTokens.AiCommandRegistryCommandRepository,
        ),
        provider.resolve<ICommandCatalog>(
          InfrastructureTokens.AiCommandRegistryCommandCatalog,
        ),
        provider.resolve<ICommandValidator>(
          InfrastructureTokens.AiCommandRegistryCommandValidator,
        ),
        provider.resolve<ICommandSerializer>(
          InfrastructureTokens.AiCommandRegistryCommandSerializer,
        ),
        provider.resolve<ICommandStatisticsProvider>(
          InfrastructureTokens.AiCommandRegistryCommandStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiCommandRegistryRegisterCommandUseCase,
    (provider) =>
      new RegisterCommandUseCase(
        provider.resolve<AiCommandRegistryService>(
          InfrastructureTokens.AiCommandRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiCommandRegistryGetCommandUseCase,
    (provider) =>
      new GetCommandUseCase(
        provider.resolve<AiCommandRegistryService>(
          InfrastructureTokens.AiCommandRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiCommandRegistryListCommandsUseCase,
    (provider) =>
      new ListCommandsUseCase(
        provider.resolve<AiCommandRegistryService>(
          InfrastructureTokens.AiCommandRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiCommandRegistryUpdateCommandUseCase,
    (provider) =>
      new UpdateCommandUseCase(
        provider.resolve<AiCommandRegistryService>(
          InfrastructureTokens.AiCommandRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiCommandRegistryDeleteCommandUseCase,
    (provider) =>
      new DeleteCommandUseCase(
        provider.resolve<AiCommandRegistryService>(
          InfrastructureTokens.AiCommandRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiCommandRegistryFindCommandByNameUseCase,
    (provider) =>
      new FindCommandByNameUseCase(
        provider.resolve<AiCommandRegistryService>(
          InfrastructureTokens.AiCommandRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiCommandRegistryListCommandsByCategoryUseCase,
    (provider) =>
      new ListCommandsByCategoryUseCase(
        provider.resolve<AiCommandRegistryService>(
          InfrastructureTokens.AiCommandRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiCommandRegistryGetCommandRegistryStatisticsUseCase,
    (provider) =>
      new GetCommandRegistryStatisticsUseCase(
        provider.resolve<AiCommandRegistryService>(
          InfrastructureTokens.AiCommandRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiCommandRegistryApplicationService,
    (provider) =>
      new AiCommandRegistryApplicationService(
        provider.resolve<RegisterCommandUseCase>(
          InfrastructureTokens.AiCommandRegistryRegisterCommandUseCase,
        ),
        provider.resolve<GetCommandUseCase>(
          InfrastructureTokens.AiCommandRegistryGetCommandUseCase,
        ),
        provider.resolve<ListCommandsUseCase>(
          InfrastructureTokens.AiCommandRegistryListCommandsUseCase,
        ),
        provider.resolve<UpdateCommandUseCase>(
          InfrastructureTokens.AiCommandRegistryUpdateCommandUseCase,
        ),
        provider.resolve<DeleteCommandUseCase>(
          InfrastructureTokens.AiCommandRegistryDeleteCommandUseCase,
        ),
        provider.resolve<FindCommandByNameUseCase>(
          InfrastructureTokens.AiCommandRegistryFindCommandByNameUseCase,
        ),
        provider.resolve<ListCommandsByCategoryUseCase>(
          InfrastructureTokens.AiCommandRegistryListCommandsByCategoryUseCase,
        ),
        provider.resolve<GetCommandRegistryStatisticsUseCase>(
          InfrastructureTokens.AiCommandRegistryGetCommandRegistryStatisticsUseCase,
        ),
      ),
  );
}
