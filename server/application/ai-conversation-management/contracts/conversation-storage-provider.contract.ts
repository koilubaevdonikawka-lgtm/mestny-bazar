import type { Conversation } from "@server/application/ai-conversation-management/models/conversation.model";

/** Future integration point for external conversation storage. Not wired yet. */
export interface IConversationStorageProvider {
  store(conversation: Conversation): Promise<void>;
  retrieve(conversationId: string): Promise<Conversation | null>;
}
