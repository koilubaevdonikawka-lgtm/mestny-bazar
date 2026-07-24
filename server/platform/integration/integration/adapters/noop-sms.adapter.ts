import type { ISmsProvider, SmsDeliveryResult, SmsMessage } from "@server/platform/integration/integration/contracts";

/** Placeholder SMS provider until an external SMS service is configured. */
export class NoopSmsProvider implements ISmsProvider {
  send(_message: SmsMessage): Promise<SmsDeliveryResult> {
    return Promise.reject(new Error("SMS provider is not configured."));
  }
}
