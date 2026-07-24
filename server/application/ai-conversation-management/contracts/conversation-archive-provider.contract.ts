import type { Conversation } from "@server/application/ai-conversation-management/models/conversation.model";

/** Future integration point for conversation archiving. Not wired yet. */
export interface IConversationArchiveProvider {
  archive(conversation: Conversation): Promise<{ archiveId: string }>;
  listArchived(conversationId: string): Promise<readonly Conversation[]>;
}
