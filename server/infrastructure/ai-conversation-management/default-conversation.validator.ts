import type {
  ConversationValidationResult,
  IConversationValidator,
} from "@server/application/ai-conversation-management/contracts/conversation-validator.contract";
import type {
  Conversation,
  CreateConversationInput,
  UpdateConversationInput,
} from "@server/application/ai-conversation-management/models/conversation.model";

/** Default conversation validator. */
export class DefaultConversationValidator implements IConversationValidator {
  async validateCreation(input: CreateConversationInput): Promise<ConversationValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Conversation name is required.");
    }
    if (
      input.status !== undefined &&
      input.status !== "active" &&
      input.status !== "closed"
    ) {
      errors.push("Conversation status must be 'active' or 'closed'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: Conversation,
    input: UpdateConversationInput,
  ): Promise<ConversationValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Conversation name cannot be empty.");
    }
    if (
      input.status !== undefined &&
      input.status !== "active" &&
      input.status !== "closed"
    ) {
      errors.push("Conversation status must be 'active' or 'closed'.");
    }

    if (!existing) {
      errors.push("Conversation is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
