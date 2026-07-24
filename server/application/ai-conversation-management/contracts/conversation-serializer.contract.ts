import type { Conversation } from "@server/application/ai-conversation-management/models/conversation.model";

export interface IConversationSerializer {
  serialize(conversation: Conversation): Promise<string>;
  deserialize(serialized: string): Promise<Conversation>;
}
