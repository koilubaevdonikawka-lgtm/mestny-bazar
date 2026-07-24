import type {
  EmailDeliveryResult,
  EmailMessage,
  IEmailProvider,
} from "@server/platform/integration/integration/contracts";

/** Placeholder email provider until SMTP or another email service is configured. */
export class NoopEmailProvider implements IEmailProvider {
  send(_message: EmailMessage): Promise<EmailDeliveryResult> {
    return Promise.reject(new Error("Email provider is not configured."));
  }
}
