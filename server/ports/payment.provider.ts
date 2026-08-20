import type { CreatePaymentRequest, PaymentIntentDTO } from "@shared/contracts/payment";

/**
 * Everything the official `@mancho.devs/authorizer` `Signer` needs to
 * rebuild the exact canonical string Finik signed for an incoming webhook
 * (Промпт №080): method, path, `Host` + every `x-api-*` header (sorted
 * internally by the library), query string, and the parsed JSON body.
 * `headers` carries only the `x-api-*` subset — the library itself filters
 * to that prefix, so nothing is lost by not forwarding the rest.
 */
export interface PaymentWebhookPayload {
  rawBody: string;
  signature: string | null;
  httpMethod: string;
  path: string;
  host: string;
  headers: Record<string, string>;
  queryStringParameters: Record<string, string> | null;
}

export interface IPaymentProvider {
  createPayment(request: CreatePaymentRequest): Promise<PaymentIntentDTO>;
  verifyWebhook(payload: PaymentWebhookPayload): Promise<boolean>;
  getStatus(providerPaymentId: string): Promise<PaymentIntentDTO | null>;
}
