/** AI conversation — generic dialog metadata only, no domain knowledge. */
export interface Conversation {
  readonly conversationId: string;
  readonly name: string;
  readonly description: string;
  readonly status: "active" | "closed";
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly closedAt: string | null;
}

export interface CreateConversationInput {
  readonly name: string;
  readonly description?: string;
  readonly status?: "active" | "closed";
}

export interface UpdateConversationInput {
  readonly conversationId: string;
  readonly name?: string;
  readonly description?: string;
  readonly status?: "active" | "closed";
}

export interface ListConversationsResult {
  readonly conversations: readonly Conversation[];
  readonly total: number;
}

export interface FindConversationByNameResult {
  readonly conversation: Conversation | null;
}

export interface ListConversationsByStatusResult {
  readonly conversations: readonly Conversation[];
  readonly total: number;
  readonly status: string;
}

export interface CloseConversationResult {
  readonly conversationId: string;
  readonly closed: boolean;
}

export interface ConversationStatistics {
  readonly totalConversations: number;
  readonly activeConversations: number;
  readonly closedConversations: number;
}

export function createConversation(input: {
  conversationId: string;
  name: string;
  description?: string;
  status?: "active" | "closed";
  createdAt?: string;
  updatedAt?: string;
  closedAt?: string | null;
}): Conversation {
  const now = new Date().toISOString();
  const status = input.status ?? "active";
  return Object.freeze({
    conversationId: input.conversationId,
    name: input.name.trim(),
    description: (input.description ?? "").trim(),
    status,
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
    closedAt: input.closedAt ?? (status === "closed" ? now : null),
  });
}
