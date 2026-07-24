import type { IConversationSerializer } from "@server/application/ai-conversation-management/contracts/conversation-serializer.contract";
import {
  createConversation,
  type Conversation,
} from "@server/application/ai-conversation-management/models/conversation.model";

/** JSON-based conversation serializer. */
export class JsonConversationSerializer implements IConversationSerializer {
  async serialize(conversation: Conversation): Promise<string> {
    return JSON.stringify(conversation);
  }

  async deserialize(serialized: string): Promise<Conversation> {
    if (!serialized.trim()) {
      throw new Error("Serialized conversation cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<Conversation>;
    return createConversation({
      conversationId: parsed.conversationId ?? "",
      name: parsed.name ?? "",
      description: parsed.description,
      status: parsed.status,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
      closedAt: parsed.closedAt,
    });
  }
}
