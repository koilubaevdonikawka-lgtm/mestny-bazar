/** Structured reason for moderation rejection or cancellation. */
export interface ModerationReason {
  readonly code: string;
  readonly message: string;
}

export function createModerationReason(
  code: string,
  message: string,
): ModerationReason {
  return Object.freeze({
    code: code.trim(),
    message: message.trim(),
  });
}

export function moderationReasonFromMessage(message: string): ModerationReason {
  return createModerationReason("manual", message);
}
