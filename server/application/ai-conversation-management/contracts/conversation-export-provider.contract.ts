import type { Conversation } from "@server/application/ai-conversation-management/models/conversation.model";

/** Future integration point for conversation export. Not wired yet. */
export interface IConversationExportProvider {
  exportConversation(conversation: Conversation): Promise<string>;
  exportAll(conversations: readonly Conversation[]): Promise<string>;
}
