/**
 * AI Conversation Management — unified management for AI conversations.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IConversationCatalog } from "@server/application/ai-conversation-management/contracts/conversation-catalog.contract";
import type { IConversationRepository } from "@server/application/ai-conversation-management/contracts/conversation-repository.contract";
import type { IConversationSerializer } from "@server/application/ai-conversation-management/contracts/conversation-serializer.contract";
import type { IConversationStatisticsProvider } from "@server/application/ai-conversation-management/contracts/conversation-statistics-provider.contract";
import type { IConversationValidator } from "@server/application/ai-conversation-management/contracts/conversation-validator.contract";
import {
  createConversation,
  type CloseConversationResult,
  type Conversation,
  type ConversationStatistics,
  type CreateConversationInput,
  type FindConversationByNameResult,
  type ListConversationsByStatusResult,
  type ListConversationsResult,
  type UpdateConversationInput,
} from "@server/application/ai-conversation-management/models/conversation.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiConversationManagementService {
  constructor(
    private readonly conversationRepository: IConversationRepository,
    private readonly conversationCatalog: IConversationCatalog,
    private readonly conversationValidator: IConversationValidator,
    private readonly conversationSerializer: IConversationSerializer,
    private readonly statisticsProvider: IConversationStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async createConversation(input: CreateConversationInput): Promise<Conversation> {
    const validation = await this.conversationValidator.validateCreation(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.conversationRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Conversation already exists with name: ${input.name.trim()}`);
    }

    const conversation = createConversation({
      conversationId: this.idGenerator.generate(),
      name: input.name,
      description: input.description,
      status: input.status,
    });

    await this.conversationRepository.save(conversation);
    await this.conversationCatalog.register(conversation);
    return conversation;
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    return this.conversationRepository.findById(conversationId.trim());
  }

  async listConversations(): Promise<ListConversationsResult> {
    const conversations = Object.freeze(
      [...(await this.conversationRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ conversations, total: conversations.length });
  }

  async updateConversation(input: UpdateConversationInput): Promise<Conversation> {
    const conversationId = input.conversationId.trim();
    const existing = await this.conversationRepository.findById(conversationId);
    if (!existing) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }

    const validation = await this.conversationValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.conversationRepository.findByName(input.name.trim());
      if (duplicate && duplicate.conversationId !== existing.conversationId) {
        throw new Error(`Conversation already exists with name: ${input.name.trim()}`);
      }
    }

    const nextStatus = input.status ?? existing.status;
    const now = new Date().toISOString();
    const updated = createConversation({
      conversationId: existing.conversationId,
      name: input.name?.trim() ?? existing.name,
      description: input.description ?? existing.description,
      status: nextStatus,
      createdAt: existing.createdAt,
      updatedAt: now,
      closedAt:
        nextStatus === "closed"
          ? existing.closedAt ?? now
          : nextStatus === "active"
            ? null
            : existing.closedAt,
    });

    await this.conversationRepository.save(updated);
    await this.conversationCatalog.register(updated);
    return updated;
  }

  async closeConversation(conversationId: string): Promise<CloseConversationResult> {
    const normalizedConversationId = conversationId.trim();
    const existing = await this.conversationRepository.findById(normalizedConversationId);
    if (!existing) {
      return Object.freeze({ conversationId: normalizedConversationId, closed: false });
    }

    if (existing.status === "closed") {
      return Object.freeze({ conversationId: normalizedConversationId, closed: true });
    }

    const now = new Date().toISOString();
    const closed = createConversation({
      conversationId: existing.conversationId,
      name: existing.name,
      description: existing.description,
      status: "closed",
      createdAt: existing.createdAt,
      updatedAt: now,
      closedAt: now,
    });

    await this.conversationRepository.save(closed);
    await this.conversationCatalog.register(closed);
    return Object.freeze({ conversationId: normalizedConversationId, closed: true });
  }

  async findConversationByName(name: string): Promise<FindConversationByNameResult> {
    const normalizedName = name.trim();
    const conversation = await this.conversationRepository.findByName(normalizedName);
    return Object.freeze({ conversation });
  }

  async listConversationsByStatus(status: string): Promise<ListConversationsByStatusResult> {
    const normalizedStatus = status.trim();
    const conversations = Object.freeze(
      [...(await this.conversationRepository.findByStatus(normalizedStatus))].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      conversations,
      total: conversations.length,
      status: normalizedStatus,
    });
  }

  async getConversationStatistics(): Promise<ConversationStatistics> {
    const conversations = await this.conversationRepository.findAll();
    const activeConversations = conversations.filter(
      (conversation) => conversation.status === "active",
    ).length;
    const closedConversations = conversations.filter(
      (conversation) => conversation.status === "closed",
    ).length;

    return this.statisticsProvider.getStatistics({
      totalConversations: conversations.length,
      activeConversations,
      closedConversations,
    });
  }

  async serializeConversation(conversation: Conversation): Promise<string> {
    return this.conversationSerializer.serialize(conversation);
  }

  async deserializeConversation(serialized: string): Promise<Conversation> {
    return this.conversationSerializer.deserialize(serialized);
  }
}
