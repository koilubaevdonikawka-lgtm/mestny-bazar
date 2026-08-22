import type { ServerEnv } from "@server/config/env";
import type { IPaymentProvider } from "@server/ports/payment.provider";
import { FinikPaymentAdapter } from "@server/adapters/payment/finik.adapter";
import { StubPaymentProvider } from "@server/adapters/payment/stub-payment.provider";

/**
 * The single decision point for which payment provider backs the app
 * (Промпт №075 "Payment Factory"): real Finik integration only when every
 * required credential is present, otherwise the safe stub — so the app is
 * always fully constructible regardless of deployment configuration.
 * Config shape updated in Промпт №077 to RSA key pair + environment
 * selector, per official Finik documentation (supersedes the earlier HMAC
 * assumption from Промпт №075).
 */
export function createPaymentProvider(env: ServerEnv): IPaymentProvider {
  const {
    FINIK_API_KEY,
    FINIK_RSA_PRIVATE_KEY,
    FINIK_WEBHOOK_PUBLIC_KEY,
    FINIK_MERCHANT_ID,
    FINIK_ENVIRONMENT,
  } = env;

  // FINIK_MERCHANT_ID is now gated here too — confirmed required (Промпт
  // №081, a real successful Finik Playground transaction), goes in
  // Data.accountId on every createPayment call, so the adapter can no
  // longer be constructed without it.
  if (
    FINIK_API_KEY &&
    FINIK_RSA_PRIVATE_KEY &&
    FINIK_WEBHOOK_PUBLIC_KEY &&
    FINIK_MERCHANT_ID &&
    FINIK_ENVIRONMENT
  ) {
    return new FinikPaymentAdapter({
      apiKey: FINIK_API_KEY,
      rsaPrivateKeyPem: FINIK_RSA_PRIVATE_KEY,
      webhookPublicKeyPem: FINIK_WEBHOOK_PUBLIC_KEY,
      merchantId: FINIK_MERCHANT_ID,
      environment: FINIK_ENVIRONMENT,
    });
  }

  return new StubPaymentProvider();
}
