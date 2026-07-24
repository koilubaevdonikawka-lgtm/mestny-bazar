import type { Conversation } from "@server/application/ai-conversation-management/models/conversation.model";

export interface IConversationRepository {
  save(conversation: Conversation): Promise<void>;
  findById(conversationId: string): Promise<Conversation | null>;
  findByName(name: string): Promise<Conversation | null>;
  findByStatus(status: string): Promise<readonly Conversation[]>;
  findAll(): Promise<readonly Conversation[]>;
  delete(conversationId: string): Promise<boolean>;
}
