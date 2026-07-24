import type {
  CloseConversationResult,
  Conversation,
  ConversationStatistics,
  CreateConversationInput,
  FindConversationByNameResult,
  ListConversationsByStatusResult,
  ListConversationsResult,
  UpdateConversationInput,
} from "@server/application/ai-conversation-management/models/conversation.model";
import type { AiConversationManagementService } from "@server/application/ai-conversation-management/services/ai-conversation-management.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class CreateConversationUseCase {
  constructor(private readonly conversationManagement: AiConversationManagementService) {}

  execute(input: CreateConversationInput): Promise<UseCaseResult<Conversation>> {
    return this.conversationManagement.createConversation(input).then(useCaseResult);
  }
}

export class GetConversationUseCase {
  constructor(private readonly conversationManagement: AiConversationManagementService) {}

  execute(conversationId: string): Promise<UseCaseResult<Conversation | null>> {
    return this.conversationManagement.getConversation(conversationId).then(useCaseResult);
  }
}

export class ListConversationsUseCase {
  constructor(private readonly conversationManagement: AiConversationManagementService) {}

  execute(): Promise<UseCaseResult<ListConversationsResult>> {
    return this.conversationManagement.listConversations().then(useCaseResult);
  }
}

export class UpdateConversationUseCase {
  constructor(private readonly conversationManagement: AiConversationManagementService) {}

  execute(input: UpdateConversationInput): Promise<UseCaseResult<Conversation>> {
    return this.conversationManagement.updateConversation(input).then(useCaseResult);
  }
}

export class CloseConversationUseCase {
  constructor(private readonly conversationManagement: AiConversationManagementService) {}

  execute(conversationId: string): Promise<UseCaseResult<CloseConversationResult>> {
    return this.conversationManagement.closeConversation(conversationId).then(useCaseResult);
  }
}

export class FindConversationByNameUseCase {
  constructor(private readonly conversationManagement: AiConversationManagementService) {}

  execute(name: string): Promise<UseCaseResult<FindConversationByNameResult>> {
    return this.conversationManagement.findConversationByName(name).then(useCaseResult);
  }
}

export class ListConversationsByStatusUseCase {
  constructor(private readonly conversationManagement: AiConversationManagementService) {}

  execute(status: string): Promise<UseCaseResult<ListConversationsByStatusResult>> {
    return this.conversationManagement.listConversationsByStatus(status).then(useCaseResult);
  }
}

export class GetConversationStatisticsUseCase {
  constructor(private readonly conversationManagement: AiConversationManagementService) {}

  execute(): Promise<UseCaseResult<ConversationStatistics>> {
    return this.conversationManagement.getConversationStatistics().then(useCaseResult);
  }
}
