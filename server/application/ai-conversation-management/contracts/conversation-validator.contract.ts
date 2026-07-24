import type {
  Conversation,
  CreateConversationInput,
  UpdateConversationInput,
} from "@server/application/ai-conversation-management/models/conversation.model";

export interface ConversationValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IConversationValidator {
  validateCreation(input: CreateConversationInput): Promise<ConversationValidationResult>;
  validateUpdate(existing: Conversation, input: UpdateConversationInput): Promise<ConversationValidationResult>;
}
