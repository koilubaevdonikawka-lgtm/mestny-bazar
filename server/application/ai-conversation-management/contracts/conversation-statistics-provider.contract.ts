import type { ConversationStatistics } from "@server/application/ai-conversation-management/models/conversation.model";

export interface IConversationStatisticsProvider {
  getStatistics(input: {
    totalConversations: number;
    activeConversations: number;
    closedConversations: number;
  }): Promise<ConversationStatistics>;
}
