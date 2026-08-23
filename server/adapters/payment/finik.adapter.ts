import { createVerify } from "node:crypto";
import type { CreatePaymentRequest, PaymentIntentDTO } from "@shared/contracts/payment";
import type { IPaymentProvider, PaymentWebhookPayload } from "@server/ports/payment.provider";
import { RetryableError } from "@shared/lib/with-retry";
import { Signer } from "@mancho.devs/authorizer";
import { BRAND } from "@/config/brand";
import { logger } from "@shared/observability/logger";

const FINIK_FETCH_TIMEOUT_MS = 10_000;

/**
 * Signature validity window per Finik's official documentation (Промпт №077)
 * — kept as a defense-in-depth replay guard on top of Signer.verify(), which
 * the library itself does not check. Same 10-second window as originally
 * intended, now expressed in milliseconds (Промпт №115) to match the units
 * `x-api-timestamp` actually carries — confirmed via live production
 * captures (Промпт №114) that the header is milliseconds
 * (e.g. "1787484423472", a 13-digit value), not seconds; the previous
 * `Math.floor(Date.now() / 1000)` compared it against seconds, which
 * rejected every real (even sub-second-old) webhook before signer.verify()
 * ever ran.
 */
const SIGNATURE_MAX_AGE_MS = 10_000;

/**
 * TEMPORARY diagnostic (Промпт №116) — Finik's official PRODUCTION webhook
 * public key, supplied directly by the architect (not secret — this is the
 * public half of Finik's own signing key pair, safe to hold in source). Used
 * only as a control in verifyWebhook() to test whether the currently
 * configured `FINIK_WEBHOOK_PUBLIC_KEY` secret matches it, since Cloudflare
 * Worker secrets cannot be read back to compare directly. Not to be removed
 * without explicit instruction.
 */
const FINIK_OFFICIAL_PRODUCTION_WEBHOOK_PUBLIC_KEY_DIAGNOSTIC = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAhnJSKxpIOWt6dFIGFi9e
JPUBrIqYPuiyIBseRNpsyYEZ/myaqrlT7Ky2IT6eBt261+M/uM6N9vRzSyToluc1
vtQdN2//z6dsaEFb2Ifb0KG6LrYNtHDhsA7H5CT/qZhags4MhQE3uYxjFAIwRpYU
NdWQVi3rwZlQbip1bM3sYrN+dQFW4GHQKSoFontMROE91uQI8nGUm/UqRKn2PBUD
Zt5KItnvjsHFEj8twsGZJrZHvLuqWlRwQmk1PF3yZLbThMC9KDRzzm57TpooI6kg
v97mQZhhBsnP9UHdZp2ZNQH+ov9EfxW+6gyGkSvzutgioBGTZ7tT/DkalUVAHiN8
pQIDAQAB
-----END PUBLIC KEY-----`;

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
    // TEMPORARY diagnostic (Промпт №114) — proves/disproves, with real
    // numbers, whether the incoming webhook's `x-api-timestamp` is seconds or
    // milliseconds, and whether isTimestampFresh() below is comparing the
    // wrong units. Logs only the raw header value (public request metadata
    // already sent to us, no secret) and Date.now() — never the signature or
    // any key material. Not to be removed without explicit instruction.
    const nowAtVerifyMs = Date.now();
    const isFresh = timestamp ? isTimestampFresh(timestamp) : false;
    logger.info("finik:webhook-timestamp-debug", {
      rawTimestampHeader: timestamp ?? null,
      nowMs: nowAtVerifyMs,
      diffAssumingHeaderIsMs: timestamp ? nowAtVerifyMs - Number(timestamp) : null,
      diffAssumingHeaderIsSeconds: timestamp ? nowAtVerifyMs - Number(timestamp) * 1000 : null,
      isTimestampFreshResult: isFresh,
    });
    if (!timestamp || !isFresh) return false;

    let bodyObject: Record<string, unknown> | null;
    try {
      bodyObject = payload.rawBody
        ? (JSON.parse(payload.rawBody) as Record<string, unknown>)
        : null;
    } catch {
      return false;
    }

    // TEMPORARY diagnostic (Промпт №117) — confirms/disproves whether
    // `bodyObject` here is the raw parse of Finik's own bytes (it is — see
    // the JSON.parse(payload.rawBody) immediately above, a separate parse
    // from finikWebhookPayloadSchema's, never touched by Zod) with its
    // ORIGINAL top-level key order, before @mancho.devs/authorizer's
    // getJsonBody() force-sorts the top level alphabetically for the
    // canonical string. If Finik's own original top-level order was not
    // already alphabetical, this forced re-sort would diverge from whatever
    // Finik actually hashed when signing. Logs only key names (no values,
    // no signature, no key material). Not to be removed without explicit
    // instruction.
    logger.info("finik:webhook-body-key-order-debug", {
      rawTopLevelKeyOrder: bodyObject ? Object.keys(bodyObject) : null,
      isAlreadyAlphabetical: bodyObject
        ? Object.keys(bodyObject).every(
            (key, i, arr) => i === 0 || arr[i - 1].localeCompare(key) <= 0,
          )
        : null,
    });

    try {
      const signer = new Signer({
        body: bodyObject,
        headers: { Host: payload.host, ...payload.headers },
        httpMethod: payload.httpMethod,
        path: payload.path,
        queryStringParameters: payload.queryStringParameters,
      });
      const configuredKeyResult = await signer.verify(
        normalizePem(this.config.webhookPublicKeyPem),
        payload.signature,
      );
      // TEMPORARY diagnostic (Промпт №116) — re-verifies the SAME real
      // signature against the official Finik production public key supplied
      // directly by the architect (not the configured secret, which cannot
      // be read back from Cloudflare to compare), as a control to prove or
      // disprove a stale/mismatched FINIK_WEBHOOK_PUBLIC_KEY without ever
      // needing to read the current secret's value. Only the two boolean
      // outcomes and the public request metadata (canonical string, host,
      // path, x-api-* headers) are logged — never the signature or any key
      // material. Not to be removed without explicit instruction.
      let officialKeyResult: boolean | "error" = "error";
      try {
        officialKeyResult = await signer.verify(
          normalizePem(FINIK_OFFICIAL_PRODUCTION_WEBHOOK_PUBLIC_KEY_DIAGNOSTIC),
          payload.signature,
        );
      } catch {
        officialKeyResult = "error";
      }
      const canonicalString = (signer as unknown as { getData(): string }).getData();
      logger.info("finik:webhook-verify-debug", {
        configuredKeyResult,
        officialProdKeyResult: officialKeyResult,
        canonicalString,
        host: payload.host,
        path: payload.path,
        xApiHeaders: payload.headers,
        queryStringParameters: payload.queryStringParameters,
      });

      // EXPERIMENTAL, TEMPORARY diagnostic (Промпт №118) — Задача №117 found
      // Finik's real webhook body arrives with a non-alphabetical top-level
      // key order (e.g. ["fields","amount","transactionDate",...]), but
      // @mancho.devs/authorizer's getJsonBody() force-sorts it alphabetically
      // before hashing — a plausible cause of configuredKeyResult/
      // officialProdKeyResult both being false independent of key material.
      // This block tests that hypothesis in PARALLEL, using the exact same
      // canonical-string recipe as Signer.getData() (method + path + headers
      // + [query] + JSON body) but WITHOUT the body re-sort — built by hand,
      // verified via Node's own crypto.createVerify() (not routed through
      // the library, since the library's getJsonBody() cannot be bypassed
      // from the outside). Runs against the official production public key
      // only (Промпт №116) — never the currently configured secret, to keep
      // this strictly a hypothesis test. Its result is logged ONLY — it does
      // NOT influence `configuredKeyResult`, the return value below, or any
      // order/payment state. Not a replacement for the real verification
      // path. Not to be switched on in production without an explicit,
      // separate architect decision. Not to be removed without explicit
      // instruction.
      try {
        const experimentalData = buildUnsortedCanonicalString(payload, bodyObject);
        const experimentalResult = verifyWithNodeCrypto(
          normalizePem(FINIK_OFFICIAL_PRODUCTION_WEBHOOK_PUBLIC_KEY_DIAGNOSTIC),
          experimentalData,
          payload.signature,
        );
        logger.info("finik:webhook-experimental-unsorted-body-verify", {
          experimentalResult,
          experimentalCanonicalString: experimentalData,
        });
      } catch (error) {
        logger.warn("finik:webhook-experimental-unsorted-body-verify-error", { error });
      }

      // EXPERIMENTAL, TEMPORARY diagnostic (Промпт №119) — Задача №118 found
      // Задача №117's unsorted-key-order hypothesis ALSO false (2/2 real
      // webhooks), even against the official key. Next candidate: every
      // canonical string built so far — including №118's — used
      // `JSON.stringify(bodyObject)`, where `bodyObject` came from
      // `JSON.parse(payload.rawBody)`. A parse→stringify round trip is NOT
      // guaranteed byte-identical to the original text: JS's JSON.stringify
      // never escapes "/" as "\/" (many other JSON encoders do, e.g. PHP's
      // default json_encode, some Java/Kotlin serializers), and number
      // formatting can differ. This checks whether that round trip actually
      // changed anything for THIS real payload, and tests two body variants
      // built from raw substrings of `payload.rawBody` itself (never
      // re-serialized): (a) as-received order, (b) top-level entries
      // reordered alphabetically by key while keeping each entry's original
      // raw bytes untouched. Logs only booleans, a rawBodyRoundTripsExactly
      // flag, and (if it differs) the byte index/snippet of the first
      // divergence — never the signature or key material. Does NOT affect
      // `configuredKeyResult`, the return value, or any order/payment state.
      // Not to be switched on in production without an explicit, separate
      // architect decision. Not to be removed without explicit instruction.
      try {
        const roundTripped = bodyObject !== null ? JSON.stringify(bodyObject) : "";
        const rawTrimmed = (payload.rawBody ?? "").trim();
        const rawBodyRoundTripsExactly = rawTrimmed === roundTripped;

        let firstDiffIndex: number | null = null;
        let rawSnippet: string | null = null;
        let roundTrippedSnippet: string | null = null;
        if (!rawBodyRoundTripsExactly) {
          const maxLen = Math.max(rawTrimmed.length, roundTripped.length);
          for (let i = 0; i < maxLen; i++) {
            if (rawTrimmed[i] !== roundTripped[i]) {
              firstDiffIndex = i;
              break;
            }
          }
          const from = Math.max(0, (firstDiffIndex ?? 0) - 20);
          rawSnippet = rawTrimmed.slice(from, (firstDiffIndex ?? 0) + 20);
          roundTrippedSnippet = roundTripped.slice(from, (firstDiffIndex ?? 0) + 20);
        }

        const rawAsIsData = buildCanonicalStringWithRawBody(payload, rawTrimmed);
        const rawAsIsResult = verifyWithNodeCrypto(
          normalizePem(FINIK_OFFICIAL_PRODUCTION_WEBHOOK_PUBLIC_KEY_DIAGNOSTIC),
          rawAsIsData,
          payload.signature,
        );

        let rawSortedResult: boolean | "parse-error" = "parse-error";
        try {
          const rawSortedBody = buildRawSortedTopLevelBody(rawTrimmed);
          const rawSortedData = buildCanonicalStringWithRawBody(payload, rawSortedBody);
          rawSortedResult = verifyWithNodeCrypto(
            normalizePem(FINIK_OFFICIAL_PRODUCTION_WEBHOOK_PUBLIC_KEY_DIAGNOSTIC),
            rawSortedData,
            payload.signature,
          );
        } catch {
          rawSortedResult = "parse-error";
        }

        logger.info("finik:webhook-experimental-raw-body-verify", {
          rawBodyRoundTripsExactly,
          firstDiffIndex,
          rawSnippet,
          roundTrippedSnippet,
          rawAsIsResult,
          rawSortedResult,
        });
      } catch (error) {
        logger.warn("finik:webhook-experimental-raw-body-verify-error", { error });
      }

      // EXPERIMENTAL, TEMPORARY diagnostic (Промпт №121) — Finik's own docs
      // ("Другие языки" section) say only "sort the JSON object by object
      // keys" without saying "top level only". Задачи №117-119 only ever
      // tested: top-level-sorted (the library's own behavior), completely
      // unsorted, and raw-byte-preserving variants of those two — never a
      // FULL recursive sort (every nesting level, including inside `data`
      // and `fields`, sorted alphabetically). Tests that specific gap here,
      // in parallel, against the official production public key only.
      // Logs only the boolean result and the resulting canonical string —
      // never the signature or key material. Does NOT affect
      // `configuredKeyResult`, the return value, or any order/payment
      // state, and does NOT touch the №118/№119 experiments above. Not to
      // be switched on in production without an explicit, separate
      // architect decision. Not to be removed without explicit instruction.
      try {
        const recursivelySortedBody = bodyObject ? deepSortKeysRecursively(bodyObject) : null;
        const recursivelySortedJson = recursivelySortedBody
          ? JSON.stringify(recursivelySortedBody)
          : "";
        const recursivelySortedData = buildCanonicalStringWithRawBody(
          payload,
          recursivelySortedJson,
        );
        const recursivelySortedResult = verifyWithNodeCrypto(
          normalizePem(FINIK_OFFICIAL_PRODUCTION_WEBHOOK_PUBLIC_KEY_DIAGNOSTIC),
          recursivelySortedData,
          payload.signature,
        );
        logger.info("finik:webhook-experimental-recursive-sort-verify", {
          recursivelySortedResult,
          recursivelySortedCanonicalString: recursivelySortedData,
        });
      } catch (error) {
        logger.warn("finik:webhook-experimental-recursive-sort-verify-error", { error });
      }

      return configuredKeyResult;
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
    // TEMPORARY diagnostic (Промпт №103) — extracts the exact canonical
    // string @mancho.devs/authorizer builds for THIS request, before
    // signing, for manual byte-for-byte comparison against Finik's
    // documented algorithm. getData() is `protected` in the library's
    // TypeScript source, but the compiled JS carries no real access
    // control (protected is erased at build time), so the direct call
    // below works at runtime — same object, no separate copy of the
    // library's logic to drift out of sync. Contains no key material or
    // signature, only the same public request metadata already sent to
    // Finik. Not to be removed without explicit instruction.
    const canonicalString = (signer as unknown as { getData(): string }).getData();
    const signature = await signer.sign(normalizePem(this.config.rsaPrivateKeyPem));
    const afterSignAt = Date.now();

    const fetchHeaders = {
      "content-type": "application/json",
      "x-api-key": this.config.apiKey,
      "x-api-timestamp": timestamp,
      signature,
    };
    // signature deliberately excluded from this log — the task explicitly
    // forbids logging the final signature; everything else here is the
    // same public request metadata already sent to Finik.
    logger.info("finik:canonical-string-debug", {
      canonicalString,
      signerHeaders: { Host: host, "x-api-key": this.config.apiKey, "x-api-timestamp": timestamp },
      fetchHeadersWithoutSignature: {
        "content-type": fetchHeaders["content-type"],
        "x-api-key": fetchHeaders["x-api-key"],
        "x-api-timestamp": fetchHeaders["x-api-timestamp"],
      },
    });

    const beforeFetchAt = Date.now();
    const response = await this.fetchWithTimeout(url, {
      method: "POST",
      redirect: "manual",
      headers: fetchHeaders,
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
  const timestampMs = Number(timestampHeader);
  if (!Number.isFinite(timestampMs)) return false;
  return Math.abs(Date.now() - timestampMs) <= SIGNATURE_MAX_AGE_MS;
}

/**
 * EXPERIMENTAL, TEMPORARY (Промпт №118) — replicates
 * @mancho.devs/authorizer's Signer.getData() recipe exactly (method + path +
 * `host:...&x-api-*:...` headers + optional query string + JSON body),
 * EXCEPT the body is serialized in its original, as-received key order
 * instead of the library's forced top-level alphabetical sort. Built by hand
 * because the library offers no option to skip that sort — there is no
 * supported way to hand it a pre-built body string. Not to be removed
 * without explicit instruction.
 */
function buildUnsortedCanonicalString(
  payload: PaymentWebhookPayload,
  bodyObject: Record<string, unknown> | null,
): string {
  const jsonBody = bodyObject ? JSON.stringify(bodyObject) : "";
  return buildCanonicalStringWithRawBody(payload, jsonBody);
}

/**
 * EXPERIMENTAL, TEMPORARY (Промпт №119) — same method/path/headers/query
 * recipe as Signer.getData()/buildUnsortedCanonicalString(), factored out so
 * the body portion can be supplied as an already-serialized string (a raw
 * substring of the original request text, or a hand-reordered version of it)
 * instead of an object that would need re-serializing — re-serializing via
 * JSON.stringify is exactly the step under suspicion in this task (it is not
 * guaranteed byte-identical to what Finik originally sent: no "\/" escaping,
 * possible number-formatting differences). Not to be removed without
 * explicit instruction.
 */
function buildCanonicalStringWithRawBody(payload: PaymentWebhookPayload, bodyText: string): string {
  const method = payload.httpMethod.toLowerCase();
  const path = decodeURI(payload.path ?? "");
  const xApiHeaderKeys = Object.keys(payload.headers)
    .filter((key) => key.toLowerCase().startsWith("x-api-"))
    .sort();
  const headersData = [
    `host:${payload.host}`,
    ...xApiHeaderKeys.map((key) => `${key.toLowerCase()}:${payload.headers[key]}`),
  ].join("&");
  const queryParams = payload.queryStringParameters ?? {};
  const queryKeys = Object.keys(queryParams).sort();
  const queryString = queryKeys
    .map((key) => `${encodeURI(decodeURI(key))}=${encodeURI(decodeURI(queryParams[key] ?? ""))}`)
    .join("&");

  const parts = [method, path, headersData];
  if (queryString) parts.push(queryString);
  parts.push(bodyText);
  return parts.join("\n");
}

/**
 * EXPERIMENTAL, TEMPORARY (Промпт №119) — splits a JSON object's TEXT
 * (already-serialized string, e.g. `payload.rawBody` itself) into its
 * top-level key/value pairs using a minimal brace/bracket/string-aware
 * scanner — never JSON.parse + re-stringify, so each entry's original raw
 * bytes (escaping, whitespace, number formatting, nested key order) survive
 * completely untouched. Only the ORDER of top-level entries is changed
 * (alphabetical by key name), mirroring what a byte-faithful version of
 * @mancho.devs/authorizer's getJsonBody() sort would do if it preserved raw
 * text instead of round-tripping through JSON.stringify. Not to be removed
 * without explicit instruction.
 */
function buildRawSortedTopLevelBody(objectText: string): string {
  const trimmed = objectText.trim();
  const inner = trimmed.slice(1, -1); // strip outer { }

  const spans: Array<[number, number]> = [];
  let depth = 0;
  let inString = false;
  let escaped = false;
  let entryStart = 0;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "{" || ch === "[") {
      depth++;
      continue;
    }
    if (ch === "}" || ch === "]") {
      depth--;
      continue;
    }
    if (ch === "," && depth === 0) {
      spans.push([entryStart, i]);
      entryStart = i + 1;
    }
  }
  spans.push([entryStart, inner.length]);

  const entries = spans
    .map(([start, end]) => inner.slice(start, end))
    .filter((raw) => raw.trim().length > 0)
    .map((raw) => {
      let depth2 = 0;
      let inString2 = false;
      let escaped2 = false;
      let colonIdx = -1;
      for (let i = 0; i < raw.length; i++) {
        const ch = raw[i];
        if (inString2) {
          if (escaped2) escaped2 = false;
          else if (ch === "\\") escaped2 = true;
          else if (ch === '"') inString2 = false;
          continue;
        }
        if (ch === '"') {
          inString2 = true;
          continue;
        }
        if (ch === "{" || ch === "[") {
          depth2++;
          continue;
        }
        if (ch === "}" || ch === "]") {
          depth2--;
          continue;
        }
        if (ch === ":" && depth2 === 0) {
          colonIdx = i;
          break;
        }
      }
      const rawKeyText = raw.slice(0, colonIdx).trim();
      const rawValueText = raw.slice(colonIdx + 1).trim();
      const key = JSON.parse(rawKeyText) as string;
      return { key, rawKeyText, rawValueText };
    });

  const sorted = [...entries].sort((a, b) => a.key.localeCompare(b.key));
  return "{" + sorted.map((e) => `${e.rawKeyText}:${e.rawValueText}`).join(",") + "}";
}

/**
 * EXPERIMENTAL, TEMPORARY (Промпт №121) — recursively sorts object keys
 * alphabetically at EVERY nesting level (unlike @mancho.devs/authorizer's
 * getJsonBody(), which only sorts the top level, and unlike Задачи №117-119's
 * experiments, which never went past the top level either way). Arrays are
 * walked element-by-element but never reordered — only object keys are
 * sorted, at any depth. Values themselves (numbers, strings, booleans) are
 * never modified, only key order changes; the resulting object is then
 * JSON.stringify'd normally (this specific input was already confirmed
 * byte-round-trip-safe for this payload in Задача №119, so re-serializing is
 * not itself a source of divergence here). Not to be removed without
 * explicit instruction.
 */
function deepSortKeysRecursively(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(deepSortKeysRecursively);
  }
  if (value !== null && typeof value === "object") {
    const sortedEntries = Object.entries(value as Record<string, unknown>)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, nested]) => [key, deepSortKeysRecursively(nested)] as const);
    return Object.fromEntries(sortedEntries);
  }
  return value;
}

/**
 * EXPERIMENTAL, TEMPORARY (Промпт №118) — verifies directly via Node's own
 * `crypto.createVerify`, bypassing @mancho.devs/authorizer entirely (its
 * `verify()` always calls its own `getData()` internally — there is no way
 * to hand it a pre-built canonical string). Not to be removed without
 * explicit instruction.
 */
function verifyWithNodeCrypto(
  publicKeyPem: string,
  data: string,
  signatureBase64: string,
): boolean {
  try {
    const verifier = createVerify("SHA256");
    verifier.update(data);
    return verifier.verify(publicKeyPem, signatureBase64, "base64");
  } catch {
    return false;
  }
}
