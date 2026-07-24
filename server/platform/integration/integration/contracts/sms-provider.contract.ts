export interface SmsMessage {
  readonly to: string;
  readonly body: string;
  readonly metadata?: Readonly<Record<string, string>>;
}

export interface SmsDeliveryResult {
  readonly messageId: string;
  readonly status: "sent" | "queued";
}

/** Platform SMS provider contract. */
export interface ISmsProvider {
  send(message: SmsMessage): Promise<SmsDeliveryResult>;
}
