import type { IConversationCatalog } from "@server/application/ai-conversation-management/contracts/conversation-catalog.contract";
import type { IConversationRepository } from "@server/application/ai-conversation-management/contracts/conversation-repository.contract";
import type { IConversationSerializer } from "@server/application/ai-conversation-management/contracts/conversation-serializer.contract";
import type { IConversationStatisticsProvider } from "@server/application/ai-conversation-management/contracts/conversation-statistics-provider.contract";
import type { IConversationValidator } from "@server/application/ai-conversation-management/contracts/conversation-validator.contract";
import {
  AiConversationManagementApplicationService,
  AiConversationManagementService,
  CloseConversationUseCase,
  CreateConversationUseCase,
  FindConversationByNameUseCase,
  GetConversationStatisticsUseCase,
  GetConversationUseCase,
  ListConversationsByStatusUseCase,
  ListConversationsUseCase,
  UpdateConversationUseCase,
} from "@server/application/ai-conversation-management";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { ConversationRepository } from "@server/infrastructure/ai-conversation-management/conversation.repository";
import { DefaultConversationCatalog } from "@server/infrastructure/ai-conversation-management/default-conversation.catalog";
import { DefaultConversationStatisticsProvider } from "@server/infrastructure/ai-conversation-management/default-conversation-statistics.provider";
import { DefaultConversationValidator } from "@server/infrastructure/ai-conversation-management/default-conversation.validator";
import { JsonConversationSerializer } from "@server/infrastructure/ai-conversation-management/json-conversation.serializer";

/** Registers AI Conversation Management services and use cases. */
export function registerAiConversationManagementApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiConversationManagementConversationRepository,
    () => new ConversationRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiConversationManagementConversationCatalog,
    () => new DefaultConversationCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiConversationManagementConversationValidator,
    () => new DefaultConversationValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiConversationManagementConversationSerializer,
    () => new JsonConversationSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiConversationManagementConversationStatisticsProvider,
    () => new DefaultConversationStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiConversationManagementService,
    (provider) =>
      new AiConversationManagementService(
        provider.resolve<IConversationRepository>(
          InfrastructureTokens.AiConversationManagementConversationRepository,
        ),
        provider.resolve<IConversationCatalog>(
          InfrastructureTokens.AiConversationManagementConversationCatalog,
        ),
        provider.resolve<IConversationValidator>(
          InfrastructureTokens.AiConversationManagementConversationValidator,
        ),
        provider.resolve<IConversationSerializer>(
          InfrastructureTokens.AiConversationManagementConversationSerializer,
        ),
        provider.resolve<IConversationStatisticsProvider>(
          InfrastructureTokens.AiConversationManagementConversationStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiConversationManagementCreateConversationUseCase,
    (provider) =>
      new CreateConversationUseCase(
        provider.resolve<AiConversationManagementService>(
          InfrastructureTokens.AiConversationManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiConversationManagementGetConversationUseCase,
    (provider) =>
      new GetConversationUseCase(
        provider.resolve<AiConversationManagementService>(
          InfrastructureTokens.AiConversationManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiConversationManagementListConversationsUseCase,
    (provider) =>
      new ListConversationsUseCase(
        provider.resolve<AiConversationManagementService>(
          InfrastructureTokens.AiConversationManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiConversationManagementUpdateConversationUseCase,
    (provider) =>
      new UpdateConversationUseCase(
        provider.resolve<AiConversationManagementService>(
          InfrastructureTokens.AiConversationManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiConversationManagementCloseConversationUseCase,
    (provider) =>
      new CloseConversationUseCase(
        provider.resolve<AiConversationManagementService>(
          InfrastructureTokens.AiConversationManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiConversationManagementFindConversationByNameUseCase,
    (provider) =>
      new FindConversationByNameUseCase(
        provider.resolve<AiConversationManagementService>(
          InfrastructureTokens.AiConversationManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiConversationManagementListConversationsByStatusUseCase,
    (provider) =>
      new ListConversationsByStatusUseCase(
        provider.resolve<AiConversationManagementService>(
          InfrastructureTokens.AiConversationManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiConversationManagementGetConversationStatisticsUseCase,
    (provider) =>
      new GetConversationStatisticsUseCase(
        provider.resolve<AiConversationManagementService>(
          InfrastructureTokens.AiConversationManagementService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiConversationManagementApplicationService,
    (provider) =>
      new AiConversationManagementApplicationService(
        provider.resolve<CreateConversationUseCase>(
          InfrastructureTokens.AiConversationManagementCreateConversationUseCase,
        ),
        provider.resolve<GetConversationUseCase>(
          InfrastructureTokens.AiConversationManagementGetConversationUseCase,
        ),
        provider.resolve<ListConversationsUseCase>(
          InfrastructureTokens.AiConversationManagementListConversationsUseCase,
        ),
        provider.resolve<UpdateConversationUseCase>(
          InfrastructureTokens.AiConversationManagementUpdateConversationUseCase,
        ),
        provider.resolve<CloseConversationUseCase>(
          InfrastructureTokens.AiConversationManagementCloseConversationUseCase,
        ),
        provider.resolve<FindConversationByNameUseCase>(
          InfrastructureTokens.AiConversationManagementFindConversationByNameUseCase,
        ),
        provider.resolve<ListConversationsByStatusUseCase>(
          InfrastructureTokens.AiConversationManagementListConversationsByStatusUseCase,
        ),
        provider.resolve<GetConversationStatisticsUseCase>(
          InfrastructureTokens.AiConversationManagementGetConversationStatisticsUseCase,
        ),
      ),
  );
}
