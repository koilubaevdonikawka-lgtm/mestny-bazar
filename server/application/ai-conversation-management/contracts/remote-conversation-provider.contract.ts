import type { Conversation } from "@server/application/ai-conversation-management/models/conversation.model";

/** Future integration point for external conversation providers. Not wired yet. */
export interface IRemoteConversationProvider {
  fetchRemote(conversationId: string): Promise<Conversation | null>;
  pushRemote(conversation: Conversation): Promise<void>;
}
