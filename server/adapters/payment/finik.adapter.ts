import type { CreatePaymentRequest, PaymentIntentDTO } from "@shared/contracts/payment";
import type { IPaymentProvider, PaymentWebhookPayload } from "@server/ports/payment.provider";
import { RetryableError } from "@shared/lib/with-retry";
import { Signer } from "@mancho.devs/authorizer";
import { BRAND } from "@/config/brand";
import { logger } from "@shared/observability/logger";

const FINIK_FETCH_TIMEOUT_MS = 10_000;

/** Signature validity window per Finik's official documentation (Промпт №077) — kept as a defense-in-depth replay guard on top of Signer.verify(), which the library itself does not check. */
const SIGNATURE_MAX_AGE_SECONDS = 10;

export type FinikEnvironment = "beta" | "production";

/**
 * Official Finik Payments Gateway endpoints (Промпт №077, provided directly
 * by the project owner from Finik's official documentation — not inferred).
 */
const FINIK_CREATE_PAYMENT_ENDPOINT: Record<FinikEnvironment, string> = {
  beta: "https://beta.api.acquiring.averspay.kg/v1/payment",
  production: "https://api.acquiring.averspay.kg/v1/payment",
};

export interface FinikAdapterConfig {
  apiKey: string;
  /** PEM-encoded RSA private key (PKCS8) — ours, signs every outgoing request. */
  rsaPrivateKeyPem: string;
  /** PEM-encoded RSA public key (SPKI) — Finik's, verifies incoming webhook signatures. */
  webhookPublicKeyPem: string;
  /** Confirmed (Промпт №081) via a real successful Finik Playground transaction under the project owner's own account — goes in `Data.accountId`, the merchant-account identifier Finik's create-payment call requires. Required, not optional: the confirmed working request always includes it. */
  merchantId: string;
  environment: FinikEnvironment;
}

/**
 * Wrangler secrets (`wrangler secret put`) store a multi-line PEM as a
 * single line with literal two-character `\n` sequences — not real
 * whitespace, so it survives untouched into the PEM text unless converted
 * back to real newlines first. `@mancho.devs/authorizer`'s `Signer` expects
 * a normal, real-newline PEM string (it hands it to `node-jose`'s
 * `JWK.createKeyStore().add(pem, 'pem')`), so this must run before every
 * `sign()`/`verify()` call — same gotcha the previous WebCrypto-based
 * implementation guarded against in its own `pemToBytes()`.
 */
function normalizePem(pem: string): string {
  return pem.replace(/\\n/g, "\n");
}

/**
 * Finik payment adapter — rebuilt (Промпт №080) against the real API
 * contract the project owner supplied from Finik's official documentation,
 * superseding the Промпт №077/078 self-built canonical-string implementation
 * with the official `@mancho.devs/authorizer` `Signer` (Finik's own
 * documented recommended signing library) for both outgoing request
 * signatures and incoming webhook verification — CONFIRMED, replaces the
 * self-built `buildCanonicalString()` this file used to carry.
 *
 * Request body shape confirmed (Промпт №081) by a real successful Finik
 * Playground transaction under the project owner's own account:
 * `{ Amount, CardType: "FINIK_QR", Data: { accountId, name_en }, PaymentId,
 * RedirectUrl }`. `CardType` is `"FINIK_QR"` (previously sent as an empty
 * string, unconfirmed); `Data.accountId` is `config.merchantId` (previously
 * an unconfirmed, optional field placed under the same name); `Data.name_en`
 * is the project's own `BRAND.name` (the merchant/store display name).
 *
 * `Data.webhookUrl` (Промпт №082) is back after briefly being dropped in
 * Промпт №081 — that Playground example never included it because it only
 * exercised key/signature validity, not a full payment cycle, so its absence
 * from the example was never a confirmed "Finik doesn't want this field"
 * signal — dropping it was an editorial mistake in Промпт №081, not a
 * Finik-confirmed decision. `webhookUrl` is the only documented mechanism by
 * which Finik learns where to POST the payment-confirmed webhook
 * (`shared/contracts/payment.ts`) — without it a payment can succeed at
 * Finik while this site never learns about it. `orderId`/`orderNumber`/
 * `currency` — also dropped in Промпт №081 — stay dropped: neither part of
 * the confirmed example nor carrying webhookUrl's same unconditional
 * architectural necessity (the payment is already uniquely identified via
 * `PaymentId`).
 */
export class FinikPaymentAdapter implements IPaymentProvider {
  constructor(private readonly config: FinikAdapterConfig) {}

  async createPayment(request: CreatePaymentRequest): Promise<PaymentIntentDTO> {
    const endpoint = FINIK_CREATE_PAYMENT_ENDPOINT[this.config.environment];
    const body = {
      Amount: request.amount,
      CardType: "FINIK_QR",
      Data: {
        accountId: this.config.merchantId,
        name_en: BRAND.name,
        webhookUrl: request.webhookUrl,
      },
      // WE choose this id and Finik echoes it back as `fields.paymentId` on
      // the success webhook — reusing the checkout idempotency key means one
      // value both prevents a duplicate call to Finik (initiatePayment's own
      // getByIdempotencyKey short-circuit, untouched by this file) AND is
      // what the webhook handler looks the local payment record up by
      // (IPaymentRepository.getByProviderPaymentId). Distinct from
      // Data.accountId (the merchant, not the payment) even though the
      // confirmed Playground example happened to use the same UUID for
      // both — that was the project owner's own test value, not a
      // requirement that the two fields be equal.
      PaymentId: request.idempotencyKey,
      RedirectUrl: request.returnUrl,
    };

    // Finik's success response is a redirect to the hosted payment page, not
    // a 2xx JSON body (Промпт №080) — `redirect: "manual"` stops `fetch`
    // from silently following it so the Location header is still readable.
    const response = await this.signedFetch(endpoint, body);

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location") ?? response.headers.get("Location");
      if (!location) {
        throw new Error(
          `Finik createPayment returned HTTP ${response.status} with no Location header — cannot redirect the customer`,
        );
      }
      return {
        id: request.idempotencyKey,
        orderId: request.orderId,
        amount: request.amount,
        currency: request.currency,
        status: "awaiting",
        paymentUrl: location,
        providerPaymentId: request.idempotencyKey,
        createdAt: new Date().toISOString(),
      };
    }

    // Any non-redirect response is an error class — assertSuccessful always
    // throws here (it has no "this status is fine" branch left to hit).
    await this.assertSuccessful(response, "createPayment");
    throw new Error(
      `Finik createPayment returned an unexpected HTTP ${response.status} without a redirect`,
    );
  }

  async verifyWebhook(payload: PaymentWebhookPayload): Promise<boolean> {
    if (!payload.signature) return false;
    const timestamp = payload.headers["x-api-timestamp"];
    if (!timestamp || !isTimestampFresh(timestamp)) return false;

    let bodyObject: Record<string, unknown> | null;
    try {
      bodyObject = payload.rawBody
        ? (JSON.parse(payload.rawBody) as Record<string, unknown>)
        : null;
    } catch {
      return false;
    }

    try {
      const signer = new Signer({
        body: bodyObject,
        headers: { Host: payload.host, ...payload.headers },
        httpMethod: payload.httpMethod,
        path: payload.path,
        queryStringParameters: payload.queryStringParameters,
      });
      return await signer.verify(normalizePem(this.config.webhookPublicKeyPem), payload.signature);
    } catch {
      return false;
    }
  }

  /**
   * Finik's official documentation (Промпт №080) describes only two
   * mechanisms: create-payment, and the success-only webhook — no
   * status-check/polling endpoint exists. The previous implementation's
   * `getStatus()` (Промпт №077) called a guessed, undocumented sub-path that
   * was never confirmed and would fail against the real API. Rather than
   * keep hitting a fictional URL (unpredictable failures, wasted retries),
   * this is now an intentional no-op: it returns `null` immediately, which
   * `PaymentService.recheckStatus()` already treats as "nothing new to
   * reconcile, leave the payment as-is" — so the order-success return-page
   * best-effort recheck (Промпт №075 item 10) keeps working exactly as
   * before, it just can no longer actively confirm a payment ahead of the
   * webhook arriving. Given Finik's own redelivery policy retries a webhook
   * for up to 24 hours, the webhook remains a reliable eventual source of
   * truth even when this returns nothing new immediately.
   */
  async getStatus(_providerPaymentId: string): Promise<PaymentIntentDTO | null> {
    return null;
  }

  /** 401/403 mean a misconfigured key/signature — never retryable, distinct diagnostic message. 400 means a rejected request shape — never retryable. 5xx is the only retryable class. */
  private async assertSuccessful(response: Response, operation: string): Promise<void> {
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        `Finik ${operation} rejected the request: HTTP ${response.status} (authentication/authorization) — check FINIK_API_KEY / FINIK_RSA_PRIVATE_KEY configuration and signature generation`,
      );
    }
    if (response.status === 400) {
      throw new Error(`Finik ${operation} rejected the request: HTTP 400 (invalid request)`);
    }

    const message = `Finik ${operation} failed: HTTP ${response.status}`;
    throw response.status >= 500 ? new RetryableError(message) : new Error(message);
  }

  /** The only outgoing call this adapter makes is createPayment's POST — no GET/status endpoint exists (see getStatus's own note). */
  private async signedFetch(url: string, body: unknown): Promise<Response> {
    // Milliseconds again (Промпт №097) — Finik's documentation and worked
    // example specify `Date.now().toString()`. Промпт №097's own stated
    // reason for retesting this — that the earlier milliseconds attempt
    // (Промпт №085) ran against a still-wrong request body, making its 4/4
    // "invalid signature" result unreliable — does NOT hold up against this
    // repo's own commit history: the body was already rebuilt into its
    // current shape (CardType/Data.accountId/name_en/webhookUrl) at commits
    // b76939f (18:58) and 33495b3 (19:16), a full hour-plus BEFORE the
    // milliseconds experiment at 7b781a3 (20:40). Nothing in the outgoing
    // request/signing path has changed since that 4/4 failure besides this
    // timestamp reverting to seconds (Промпт №091) and two read-only
    // diagnostic fields — so this retest is very likely to reproduce the
    // same "invalid signature" result, not a new one. Flagged to the
    // architect; proceeding with the requested change regardless, since
    // it's narrow, reversible, and the deploy was pre-authorized pending
    // this report.
    const timestamp = Date.now().toString();
    // TEMPORARY diagnostic (Промпт №084) — measures wall-clock time between
    // minting x-api-timestamp and Finik actually receiving/validating it, to
    // test the hypothesis that a cold-start node-jose RSA key import inside
    // Signer.sign() delays the request enough for Finik's own timestamp
    // window to reject it as expired (HTTP 401 "An expired timestamp is
    // provided", Промпт №083). Logs numeric millisecond deltas only — never
    // the timestamp value, the signature, or any key material. Not to be
    // removed without explicit instruction.
    const tsGeneratedAt = Date.now();
    const { pathname, host } = new URL(url);
    const signer = new Signer({
      body: (body as Record<string, unknown> | undefined) ?? null,
      headers: { Host: host, "x-api-key": this.config.apiKey, "x-api-timestamp": timestamp },
      httpMethod: "POST",
      path: pathname,
      // Промпт №097 asked for `undefined` here to match the official
      // example's exact literal — left as `null` instead: the installed
      // @mancho.devs/authorizer's own RequestData type declares this field
      // as `QueryStringParameters | null` (not optional, no `undefined` in
      // the union), so `undefined` fails typecheck outright. Functionally
      // moot either way — the library's own getQueryStringParamsData() does
      // `this.requestData.queryStringParameters ?? {}`, which treats `null`
      // and `undefined` identically — so this can't be the cause of the
      // signature failures regardless of which literal is used.
      queryStringParameters: null,
    });
    const signature = await signer.sign(normalizePem(this.config.rsaPrivateKeyPem));
    const afterSignAt = Date.now();

    const beforeFetchAt = Date.now();
    const response = await this.fetchWithTimeout(url, {
      method: "POST",
      redirect: "manual",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.config.apiKey,
        "x-api-timestamp": timestamp,
        signature,
      },
      body: JSON.stringify(body),
    });
    const afterFetchAt = Date.now();

    logger.info("finik:timestamp-timing", {
      signMs: afterSignAt - tsGeneratedAt,
      totalBeforeSendMs: beforeFetchAt - tsGeneratedAt,
      roundTripMs: afterFetchAt - beforeFetchAt,
    });

    // TEMPORARY diagnostic (Промпт №083, moved here in Промпт №091 so the
    // request's own `timestamp` is in scope) — logs Finik's raw
    // createPayment response (their status/headers/body only, never our own
    // request secrets) plus the exact timestamp value this request sent and
    // its human-readable UTC equivalent, so a real production case can be
    // inspected via `wrangler tail`. Not to be removed without explicit
    // instruction.
    logger.info("finik:create-payment-raw-response", {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: await response
        .clone()
        .json()
        .catch(() => null),
      sentTimestamp: timestamp,
      sentTimestampAsDate: new Date(Number(timestamp) * 1000).toISOString(),
    });

    return response;
  }

  private async fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
    try {
      return await fetch(url, { ...init, signal: AbortSignal.timeout(FINIK_FETCH_TIMEOUT_MS) });
    } catch (error) {
      throw new RetryableError("Finik request failed (network/timeout)", error);
    }
  }
}

function isTimestampFresh(timestampHeader: string): boolean {
  const timestamp = Number(timestampHeader);
  if (!Number.isFinite(timestamp)) return false;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return Math.abs(nowSeconds - timestamp) <= SIGNATURE_MAX_AGE_SECONDS;
}
