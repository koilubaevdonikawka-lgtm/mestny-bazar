import type { Conversation } from "@server/application/ai-conversation-management/models/conversation.model";

export interface IConversationCatalog {
  register(conversation: Conversation): Promise<void>;
  remove(conversationId: string): Promise<void>;
  findById(conversationId: string): Promise<Conversation | null>;
  findByName(name: string): Promise<Conversation | null>;
  findByStatus(status: string): Promise<readonly Conversation[]>;
  listAll(): Promise<readonly Conversation[]>;
}
