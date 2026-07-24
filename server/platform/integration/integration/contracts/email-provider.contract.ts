export interface EmailMessage {
  readonly to: string;
  readonly subject: string;
  readonly body: string;
  readonly html?: string;
  readonly metadata?: Readonly<Record<string, string>>;
}

export interface EmailDeliveryResult {
  readonly messageId: string;
  readonly status: "sent" | "queued";
}

/** Platform email provider contract. */
export interface IEmailProvider {
  send(message: EmailMessage): Promise<EmailDeliveryResult>;
}
