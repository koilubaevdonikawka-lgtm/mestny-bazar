/** Задача №218 — admin "Массовая рассылка push" (admin/marketing). */
export interface PushBroadcastDTO {
  id: string;
  title: string;
  body: string;
  recipientCount: number;
  sentBy: string;
  createdAt: string;
}

export interface SendPushBroadcastRequest {
  title: string;
  body: string;
}

/** Shown before sending, and re-fetched after — how many customers would actually receive it right now, plus the cooldown state from the most recent broadcast (if any). */
export interface PushBroadcastAudienceDTO {
  customerCount: number;
  /** Null if no broadcast has ever been sent, or the cooldown from the last one has already elapsed. */
  cooldownRemainingSeconds: number | null;
  lastBroadcast: PushBroadcastDTO | null;
}
