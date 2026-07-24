import type { IConversationRepository } from "@server/application/ai-conversation-management/contracts/conversation-repository.contract";
import type { Conversation } from "@server/application/ai-conversation-management/models/conversation.model";

/** In-memory conversation store. */
export class ConversationRepository implements IConversationRepository {
  private readonly conversations = new Map<string, Conversation>();
  private readonly conversationsByName = new Map<string, string>();
  private readonly conversationsByStatus = new Map<string, Set<string>>();

  async save(conversation: Conversation): Promise<void> {
    const existing = this.conversations.get(conversation.conversationId);
    if (existing) {
      if (existing.name !== conversation.name) {
        this.conversationsByName.delete(existing.name);
      }
      if (existing.status !== conversation.status) {
        this.removeFromStatus(existing.status, existing.conversationId);
      }
    }

    this.conversations.set(conversation.conversationId, conversation);
    this.conversationsByName.set(conversation.name, conversation.conversationId);
    this.addToStatus(conversation.status, conversation.conversationId);
  }

  async findById(conversationId: string): Promise<Conversation | null> {
    return this.conversations.get(conversationId.trim()) ?? null;
  }

  async findByName(name: string): Promise<Conversation | null> {
    const conversationId = this.conversationsByName.get(name.trim());
    if (!conversationId) {
      return null;
    }
    return this.conversations.get(conversationId) ?? null;
  }

  async findByStatus(status: string): Promise<readonly Conversation[]> {
    const conversationIds = this.conversationsByStatus.get(status.trim());
    if (!conversationIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...conversationIds]
        .map((conversationId) => this.conversations.get(conversationId))
        .filter((conversation): conversation is Conversation => conversation !== undefined),
    );
  }

  async findAll(): Promise<readonly Conversation[]> {
    return Object.freeze([...this.conversations.values()]);
  }

  async delete(conversationId: string): Promise<boolean> {
    const conversation = await this.findById(conversationId);
    if (!conversation) {
      return false;
    }
    this.conversations.delete(conversation.conversationId);
    this.conversationsByName.delete(conversation.name);
    this.removeFromStatus(conversation.status, conversation.conversationId);
    return true;
  }

  private addToStatus(status: string, conversationId: string): void {
    const normalizedStatus = status.trim();
    const statusSet = this.conversationsByStatus.get(normalizedStatus) ?? new Set<string>();
    statusSet.add(conversationId);
    this.conversationsByStatus.set(normalizedStatus, statusSet);
  }

  private removeFromStatus(status: string, conversationId: string): void {
    const normalizedStatus = status.trim();
    const statusSet = this.conversationsByStatus.get(normalizedStatus);
    if (!statusSet) {
      return;
    }
    statusSet.delete(conversationId);
    if (statusSet.size === 0) {
      this.conversationsByStatus.delete(normalizedStatus);
    }
  }
}
