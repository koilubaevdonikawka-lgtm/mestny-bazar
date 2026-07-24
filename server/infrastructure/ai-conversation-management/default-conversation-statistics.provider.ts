import type { IConversationStatisticsProvider } from "@server/application/ai-conversation-management/contracts/conversation-statistics-provider.contract";
import type { ConversationStatistics } from "@server/application/ai-conversation-management/models/conversation.model";

/** Default in-memory conversation statistics provider. */
export class DefaultConversationStatisticsProvider implements IConversationStatisticsProvider {
  async getStatistics(input: {
    totalConversations: number;
    activeConversations: number;
    closedConversations: number;
  }): Promise<ConversationStatistics> {
    return Object.freeze({
      totalConversations: input.totalConversations,
      activeConversations: input.activeConversations,
      closedConversations: input.closedConversations,
    });
  }
}
