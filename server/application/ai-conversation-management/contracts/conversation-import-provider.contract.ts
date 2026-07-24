import type { Conversation } from "@server/application/ai-conversation-management/models/conversation.model";

/** Future integration point for conversation import. Not wired yet. */
export interface IConversationImportProvider {
  importFromSource(source: string): Promise<readonly Conversation[]>;
}
