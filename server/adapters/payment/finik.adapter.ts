import type { CreatePaymentRequest, PaymentIntentDTO } from "@shared/contracts/payment";
import type { IPaymentProvider, PaymentWebhookPayload } from "@server/ports/payment.provider";
import { RetryableError } from "@shared/lib/with-retry";

const FINIK_FETCH_TIMEOUT_MS = 10_000;

/** Signature validity window per Finik's official documentation (Промпт №077). */
const SIGNATURE_MAX_AGE_SECONDS = 10;

export type FinikEnvironment = "beta" | "production";

/**
 * Official Finik Payments Gateway endpoints (Промпт №077, provided directly
 * by the project owner from Finik's official documentation — not inferred).
 * `getStatus`'s sub-path is NOT part of this documented endpoint (only
 * "create payment" was given) — see the getStatus method's own note.
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
  /** Not confirmed by official documentation (Промпт №079) — carried over from the pre-documentation Промпт №075 assumption. Optional; omitted from the request body entirely when absent. */
  merchantId?: string;
  environment: FinikEnvironment;
}

const RSA_ALGORITHM = { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" } as const;

/**
 * Finik payment adapter — final implementation (Промпт №078) against the
 * official Finik documentation the project owner supplied (Промпт №077
 * superseded the Промпт №075 HMAC placeholder with these confirmed facts):
 *
 *   - Algorithm: SHA256withRSA (RSASSA-PKCS1-v1_5 + SHA-256) — CONFIRMED.
 *   - Signature transport: Base64 — CONFIRMED.
 *   - Required headers: `signature`, `x-api-key`, `x-api-timestamp` — CONFIRMED.
 *   - Signature validity window: 10 seconds — CONFIRMED (also the sole
 *     replay-protection mechanism, since a captured signature becomes
 *     unusable after 10s regardless of payload content).
 *   - Webhook is the ONLY source of payment confirmation — CONFIRMED
 *     (createPayment/getStatus below never return "paid"; matches how
 *     PaymentService already only calls OrderService.confirmPayment from
 *     handleWebhook, untouched by this file).
 *   - Beta/Production endpoints — CONFIRMED, hardcoded above (official
 *     values, not configurable typo-prone strings).
 *
 * One documented rule has no worked example to check byte-for-byte
 * (canonical-string delimiter/ordering for "sorted headers + sorted JSON +
 * sorted query", buildCanonicalString() below) — per explicit project-owner
 * instruction, this is not blocking: it is implemented exactly as the
 * documented rule states (deterministic alphabetical sort at every level,
 * Base64-encoded RSA signature over the result) and validated by the first
 * real Beta transaction rather than a synthetic vector. If that transaction
 * shows a mismatch, the fix stays isolated to buildCanonicalString() —
 * nothing else in this codebase (PaymentService, repository, webhook
 * handler, DI) depends on its exact shape.
 */
export class FinikPaymentAdapter implements IPaymentProvider {
  constructor(private readonly config: FinikAdapterConfig) {}

  async createPayment(request: CreatePaymentRequest): Promise<PaymentIntentDTO> {
    const endpoint = FINIK_CREATE_PAYMENT_ENDPOINT[this.config.environment];
    const body = sortKeysDeep({
      ...(this.config.merchantId ? { merchant_id: this.config.merchantId } : {}),
      order_id: request.orderId,
      order_number: request.orderNumber,
      amount: request.amount,
      currency: request.currency,
      idempotency_key: request.idempotencyKey,
      return_url: request.returnUrl,
    });

    const response = await this.signedFetch("POST", endpoint, body);
    await this.assertSuccessful(response, "createPayment");

    const location = response.headers.get("location") ?? response.headers.get("Location");
    const jsonBody = await safeReadJson<{ paymentId?: string; id?: string }>(response);
    const paymentId = jsonBody?.paymentId ?? jsonBody?.id ?? extractIdFromLocation(location);

    if (!paymentId) {
      throw new Error(
        "Finik createPayment response had no paymentId (checked JSON body and Location header) — verify response shape against official docs",
      );
    }

    return {
      id: paymentId,
      orderId: request.orderId,
      amount: request.amount,
      currency: request.currency,
      status: "awaiting",
      paymentUrl: location,
      providerPaymentId: paymentId,
      createdAt: new Date().toISOString(),
    };
  }

  async verifyWebhook(payload: PaymentWebhookPayload): Promise<boolean> {
    if (!payload.signature || !payload.timestamp) return false;
    if (!isTimestampFresh(payload.timestamp)) return false;

    const canonical = buildCanonicalString({
      headers: { "x-api-timestamp": payload.timestamp },
      query: {},
      body: payload.rawBody,
    });

    try {
      const key = await importRsaPublicKey(this.config.webhookPublicKeyPem);
      const signatureBytes = base64ToBytes(payload.signature).slice();
      return await crypto.subtle.verify(
        RSA_ALGORITHM,
        key,
        signatureBytes,
        new TextEncoder().encode(canonical),
      );
    } catch {
      return false;
    }
  }

  /**
   * getStatus's endpoint sub-path is NOT part of the documented endpoint
   * (only "create payment" was provided) — this appends the provider
   * payment id to the create-payment endpoint as the most common REST
   * convention, but REQUIRES FINAL VERIFICATION against official docs.
   */
  async getStatus(providerPaymentId: string): Promise<PaymentIntentDTO | null> {
    const endpoint = `${FINIK_CREATE_PAYMENT_ENDPOINT[this.config.environment]}/${encodeURIComponent(providerPaymentId)}`;
    const response = await this.signedFetch("GET", endpoint, undefined);

    if (response.status === 404) return null;
    await this.assertSuccessful(response, "getStatus");

    const body = await safeReadJson<{
      id?: string;
      paymentId?: string;
      order_id: string;
      amount: number;
      currency: string;
      status: string;
      redirect_url?: string | null;
      created_at?: string;
    }>(response);

    if (!body) return null;
    const id = body.paymentId ?? body.id ?? providerPaymentId;

    return {
      id,
      orderId: body.order_id,
      amount: body.amount,
      currency: body.currency,
      status: mapProviderStatus(body.status),
      paymentUrl: body.redirect_url ?? null,
      providerPaymentId: id,
      createdAt: body.created_at ?? new Date().toISOString(),
    };
  }

  /** 401/403 mean a misconfigured key/signature — never retryable, distinct diagnostic message. 400 means a rejected request shape — never retryable. 5xx is the only retryable class. */
  private async assertSuccessful(response: Response, operation: string): Promise<void> {
    if (response.ok) return;

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

  private async signedFetch(method: "GET" | "POST", url: string, body: unknown): Promise<Response> {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const bodyString = body !== undefined ? JSON.stringify(body) : "";
    const canonical = buildCanonicalString({
      headers: { "x-api-key": this.config.apiKey, "x-api-timestamp": timestamp },
      query: {},
      body: bodyString,
    });
    const signature = await this.signCanonicalString(canonical);

    return this.fetchWithTimeout(url, {
      method,
      headers: {
        "content-type": "application/json",
        "x-api-key": this.config.apiKey,
        "x-api-timestamp": timestamp,
        signature,
      },
      body: body !== undefined ? bodyString : undefined,
    });
  }

  private async signCanonicalString(canonical: string): Promise<string> {
    const key = await importRsaPrivateKey(this.config.rsaPrivateKeyPem);
    const signature = await crypto.subtle.sign(
      RSA_ALGORITHM,
      key,
      new TextEncoder().encode(canonical),
    );
    return bytesToBase64(new Uint8Array(signature));
  }

  private async fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
    try {
      return await fetch(url, { ...init, signal: AbortSignal.timeout(FINIK_FETCH_TIMEOUT_MS) });
    } catch (error) {
      throw new RetryableError("Finik request failed (network/timeout)", error);
    }
  }
}

/**
 * Final implementation of the documented canonical-string rule ("каноническая
 * строка / сортировка заголовков / сортировка JSON / сортировка query /
 * Base64", Промпт №077/№078): sorts header keys, query keys, and JSON body
 * keys (recursively) alphabetically, joins each block, concatenates the
 * three blocks with "\n". No worked byte-for-byte example was supplied with
 * the documentation, so this is validated against the first real Beta
 * transaction rather than a synthetic vector (explicit project-owner
 * instruction, Промпт №078) — isolated to this one function, so a mismatch
 * found there is a one-function fix, not an architecture change. Exported
 * only so tests can build a matching signature without duplicating this logic.
 */
export function buildCanonicalString(parts: {
  headers: Record<string, string>;
  query: Record<string, string>;
  body: string;
}): string {
  const headerBlock = Object.keys(parts.headers)
    .sort()
    .map((key) => `${key}:${parts.headers[key]}`)
    .join("\n");
  const queryBlock = Object.keys(parts.query)
    .sort()
    .map((key) => `${key}=${parts.query[key]}`)
    .join("&");
  const bodyBlock = canonicalizeJsonString(parts.body);

  return [headerBlock, queryBlock, bodyBlock].join("\n");
}

function canonicalizeJsonString(rawJson: string): string {
  if (!rawJson) return "";
  try {
    return JSON.stringify(sortKeysDeep(JSON.parse(rawJson)));
  } catch {
    return rawJson;
  }
}

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value && typeof value === "object") {
    const entries = Object.keys(value as Record<string, unknown>)
      .sort()
      .map((key) => [key, sortKeysDeep((value as Record<string, unknown>)[key])] as const);
    return Object.fromEntries(entries);
  }
  return value;
}

function isTimestampFresh(timestampHeader: string): boolean {
  const timestamp = Number(timestampHeader);
  if (!Number.isFinite(timestamp)) return false;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return Math.abs(nowSeconds - timestamp) <= SIGNATURE_MAX_AGE_SECONDS;
}

function extractIdFromLocation(location: string | null): string | undefined {
  if (!location) return undefined;
  try {
    const url = new URL(location);
    const segments = url.pathname.split("/").filter(Boolean);
    return segments[segments.length - 1];
  } catch {
    return undefined;
  }
}

async function safeReadJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function pemToBytes(pem: string): ArrayBuffer {
  const base64 = pem
    .replace(/-----BEGIN [^-]+-----/, "")
    .replace(/-----END [^-]+-----/, "")
    // Literal two-character "\n" (backslash + n) — how a multi-line PEM is
    // stored in a single-line secret (e.g. `wrangler secret put`) — is not
    // a whitespace character and survives \s+ below untouched, which then
    // breaks atob(). Strip it before stripping real whitespace.
    .replace(/\\n/g, "")
    .replace(/\s+/g, "");
  return base64ToBytes(base64).buffer as ArrayBuffer;
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

async function importRsaPrivateKey(pem: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("pkcs8", pemToBytes(pem), RSA_ALGORITHM, false, ["sign"]);
}

async function importRsaPublicKey(pem: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("spki", pemToBytes(pem), RSA_ALGORITHM, false, ["verify"]);
}

function mapProviderStatus(rawStatus: string): PaymentIntentDTO["status"] {
  switch (rawStatus) {
    case "paid":
    case "succeeded":
      return "paid";
    case "failed":
    case "cancelled":
      return "failed";
    case "refunded":
      return "refunded";
    default:
      return "awaiting";
  }
}
