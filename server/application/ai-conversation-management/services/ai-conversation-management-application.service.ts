import type {
  CreateConversationInput,
  UpdateConversationInput,
} from "@server/application/ai-conversation-management/models/conversation.model";
import {
  CloseConversationUseCase,
  CreateConversationUseCase,
  FindConversationByNameUseCase,
  GetConversationStatisticsUseCase,
  GetConversationUseCase,
  ListConversationsByStatusUseCase,
  ListConversationsUseCase,
  UpdateConversationUseCase,
} from "@server/application/ai-conversation-management/use-cases/ai-conversation-management.use-cases";

/** Application facade for AI Conversation Management scenario. */
export class AiConversationManagementApplicationService {
  constructor(
    private readonly createConversationUseCase: CreateConversationUseCase,
    private readonly getConversationUseCase: GetConversationUseCase,
    private readonly listConversationsUseCase: ListConversationsUseCase,
    private readonly updateConversationUseCase: UpdateConversationUseCase,
    private readonly closeConversationUseCase: CloseConversationUseCase,
    private readonly findConversationByNameUseCase: FindConversationByNameUseCase,
    private readonly listConversationsByStatusUseCase: ListConversationsByStatusUseCase,
    private readonly getConversationStatisticsUseCase: GetConversationStatisticsUseCase,
  ) {}

  createConversation(input: CreateConversationInput) {
    return this.createConversationUseCase.execute(input);
  }

  getConversation(conversationId: string) {
    return this.getConversationUseCase.execute(conversationId);
  }

  listConversations() {
    return this.listConversationsUseCase.execute();
  }

  updateConversation(input: UpdateConversationInput) {
    return this.updateConversationUseCase.execute(input);
  }

  closeConversation(conversationId: string) {
    return this.closeConversationUseCase.execute(conversationId);
  }

  findConversationByName(name: string) {
    return this.findConversationByNameUseCase.execute(name);
  }

  listConversationsByStatus(status: string) {
    return this.listConversationsByStatusUseCase.execute(status);
  }

  getConversationStatistics() {
    return this.getConversationStatisticsUseCase.execute();
  }
}
