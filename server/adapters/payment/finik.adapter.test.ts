import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { FinikPaymentAdapter, buildCanonicalString } from "@server/adapters/payment/finik.adapter";
import { RetryableError } from "@shared/lib/with-retry";

let privateKeyPem: string;
let publicKeyPem: string;

const CONFIG_BASE = {
  apiKey: "test-api-key",
  merchantId: "merchant-1",
  environment: "beta" as const,
};
const BETA_ENDPOINT = "https://beta.api.acquiring.averspay.kg/v1/payment";

function stubFetch(handler: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) {
  const spy = vi.fn(handler);
  vi.stubGlobal("fetch", spy);
  return spy;
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function toPem(buffer: ArrayBuffer, label: string): string {
  const base64 = bufferToBase64(buffer);
  const lines = base64.match(/.{1,64}/g) ?? [base64];
  return `-----BEGIN ${label}-----\n${lines.join("\n")}\n-----END ${label}-----`;
}

async function generateRsaKeyPair(): Promise<{ privateKeyPem: string; publicKeyPem: string }> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"],
  );
  const privateKeyBuffer = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
  const publicKeyBuffer = await crypto.subtle.exportKey("spki", keyPair.publicKey);
  return {
    privateKeyPem: toPem(privateKeyBuffer, "PRIVATE KEY"),
    publicKeyPem: toPem(publicKeyBuffer, "PUBLIC KEY"),
  };
}

async function signWithTestKey(canonical: string): Promise<string> {
  const pemBody = privateKeyPem
    .replace(/-----BEGIN [^-]+-----/, "")
    .replace(/-----END [^-]+-----/, "")
    .replace(/\s+/g, "");
  const binary = atob(pemBody);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const key = await crypto.subtle.importKey(
    "pkcs8",
    bytes.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    key,
    new TextEncoder().encode(canonical),
  );
  return bufferToBase64(signature);
}

beforeAll(async () => {
  const pair = await generateRsaKeyPair();
  privateKeyPem = pair.privateKeyPem;
  publicKeyPem = pair.publicKeyPem;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("FinikPaymentAdapter.createPayment", () => {
  it("POSTs to the official Beta endpoint with signature/x-api-key/x-api-timestamp headers", async () => {
    const fetchSpy = stubFetch(
      async () => new Response(JSON.stringify({ paymentId: "provider-1" }), { status: 200 }),
    );
    const adapter = new FinikPaymentAdapter({
      ...CONFIG_BASE,
      rsaPrivateKeyPem: privateKeyPem,
      webhookPublicKeyPem: publicKeyPem,
    });

    await adapter.createPayment({
      orderId: "order-1",
      orderNumber: 1001,
      amount: 500,
      currency: "KGS",
      idempotencyKey: "idem-1",
      returnUrl: "https://mesnyibazar.com/order-success",
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe(BETA_ENDPOINT);
    expect(init?.method).toBe("POST");
    const headers = init?.headers as Record<string, string>;
    expect(headers["x-api-key"]).toBe("test-api-key");
    expect(typeof headers["x-api-timestamp"]).toBe("string");
    expect(typeof headers.signature).toBe("string");
  });

  it("omits merchant_id from the request body when not configured (Промпт №079 — not officially confirmed)", async () => {
    const fetchSpy = stubFetch(
      async () => new Response(JSON.stringify({ paymentId: "provider-1" }), { status: 200 }),
    );
    const { merchantId: _unused, ...configWithoutMerchantId } = CONFIG_BASE;
    const adapter = new FinikPaymentAdapter({
      ...configWithoutMerchantId,
      rsaPrivateKeyPem: privateKeyPem,
      webhookPublicKeyPem: publicKeyPem,
    });

    await adapter.createPayment({
      orderId: "order-1",
      orderNumber: 1001,
      amount: 500,
      currency: "KGS",
      idempotencyKey: "idem-1",
      returnUrl: "https://mesnyibazar.com/order-success",
    });

    const [, init] = fetchSpy.mock.calls[0];
    const sentBody = JSON.parse(init?.body as string);
    expect(sentBody).not.toHaveProperty("merchant_id");
  });

  it("reads paymentId from the JSON body when present", async () => {
    stubFetch(
      async () => new Response(JSON.stringify({ paymentId: "provider-1" }), { status: 200 }),
    );
    const adapter = new FinikPaymentAdapter({
      ...CONFIG_BASE,
      rsaPrivateKeyPem: privateKeyPem,
      webhookPublicKeyPem: publicKeyPem,
    });

    const result = await adapter.createPayment({
      orderId: "order-1",
      orderNumber: 1001,
      amount: 500,
      currency: "KGS",
      idempotencyKey: "idem-1",
      returnUrl: "https://mesnyibazar.com/order-success",
    });

    expect(result.providerPaymentId).toBe("provider-1");
  });

  it("falls back to extracting paymentId from the Location header when the body has none", async () => {
    stubFetch(
      async () =>
        new Response("{}", {
          status: 200,
          headers: { location: "https://checkout.finik.kg/payments/provider-2" },
        }),
    );
    const adapter = new FinikPaymentAdapter({
      ...CONFIG_BASE,
      rsaPrivateKeyPem: privateKeyPem,
      webhookPublicKeyPem: publicKeyPem,
    });

    const result = await adapter.createPayment({
      orderId: "order-1",
      orderNumber: 1001,
      amount: 500,
      currency: "KGS",
      idempotencyKey: "idem-1",
      returnUrl: "https://mesnyibazar.com/order-success",
    });

    expect(result.providerPaymentId).toBe("provider-2");
    expect(result.paymentUrl).toBe("https://checkout.finik.kg/payments/provider-2");
  });

  it("throws a non-retryable error with a distinct message on 401", async () => {
    stubFetch(async () => new Response("", { status: 401 }));
    const adapter = new FinikPaymentAdapter({
      ...CONFIG_BASE,
      rsaPrivateKeyPem: privateKeyPem,
      webhookPublicKeyPem: publicKeyPem,
    });

    await expect(
      adapter.createPayment({
        orderId: "order-1",
        orderNumber: 1001,
        amount: 500,
        currency: "KGS",
        idempotencyKey: "idem-1",
        returnUrl: "https://mesnyibazar.com/order-success",
      }),
    ).rejects.toMatchObject({ message: expect.stringContaining("authentication/authorization") });
  });

  it("throws a non-retryable error on 403", async () => {
    stubFetch(async () => new Response("", { status: 403 }));
    const adapter = new FinikPaymentAdapter({
      ...CONFIG_BASE,
      rsaPrivateKeyPem: privateKeyPem,
      webhookPublicKeyPem: publicKeyPem,
    });

    await expect(
      adapter.createPayment({
        orderId: "order-1",
        orderNumber: 1001,
        amount: 500,
        currency: "KGS",
        idempotencyKey: "idem-1",
        returnUrl: "https://mesnyibazar.com/order-success",
      }),
    ).rejects.not.toBeInstanceOf(RetryableError);
  });

  it("throws a non-retryable error on 400", async () => {
    stubFetch(async () => new Response("", { status: 400 }));
    const adapter = new FinikPaymentAdapter({
      ...CONFIG_BASE,
      rsaPrivateKeyPem: privateKeyPem,
      webhookPublicKeyPem: publicKeyPem,
    });

    await expect(
      adapter.createPayment({
        orderId: "order-1",
        orderNumber: 1001,
        amount: 500,
        currency: "KGS",
        idempotencyKey: "idem-1",
        returnUrl: "https://mesnyibazar.com/order-success",
      }),
    ).rejects.not.toBeInstanceOf(RetryableError);
  });

  it("throws a RetryableError on a 5xx response", async () => {
    stubFetch(async () => new Response("", { status: 503 }));
    const adapter = new FinikPaymentAdapter({
      ...CONFIG_BASE,
      rsaPrivateKeyPem: privateKeyPem,
      webhookPublicKeyPem: publicKeyPem,
    });

    await expect(
      adapter.createPayment({
        orderId: "order-1",
        orderNumber: 1001,
        amount: 500,
        currency: "KGS",
        idempotencyKey: "idem-1",
        returnUrl: "https://mesnyibazar.com/order-success",
      }),
    ).rejects.toBeInstanceOf(RetryableError);
  });

  it("throws a RetryableError when the network request itself fails", async () => {
    stubFetch(async () => {
      throw new Error("network down");
    });
    const adapter = new FinikPaymentAdapter({
      ...CONFIG_BASE,
      rsaPrivateKeyPem: privateKeyPem,
      webhookPublicKeyPem: publicKeyPem,
    });

    await expect(
      adapter.createPayment({
        orderId: "order-1",
        orderNumber: 1001,
        amount: 500,
        currency: "KGS",
        idempotencyKey: "idem-1",
        returnUrl: "https://mesnyibazar.com/order-success",
      }),
    ).rejects.toBeInstanceOf(RetryableError);
  });

  it("POSTs to the Production endpoint when configured for production", async () => {
    const fetchSpy = stubFetch(
      async () => new Response(JSON.stringify({ paymentId: "provider-1" }), { status: 200 }),
    );
    const adapter = new FinikPaymentAdapter({
      ...CONFIG_BASE,
      environment: "production",
      rsaPrivateKeyPem: privateKeyPem,
      webhookPublicKeyPem: publicKeyPem,
    });

    await adapter.createPayment({
      orderId: "order-1",
      orderNumber: 1001,
      amount: 500,
      currency: "KGS",
      idempotencyKey: "idem-1",
      returnUrl: "https://mesnyibazar.com/order-success",
    });

    expect(fetchSpy.mock.calls[0][0]).toBe("https://api.acquiring.averspay.kg/v1/payment");
  });
});

describe("FinikPaymentAdapter.verifyWebhook (RSA, SHA256withRSA)", () => {
  it("returns true for a signature genuinely produced by the matching private key", async () => {
    const adapter = new FinikPaymentAdapter({
      ...CONFIG_BASE,
      rsaPrivateKeyPem: privateKeyPem,
      webhookPublicKeyPem: publicKeyPem,
    });
    const rawBody = JSON.stringify({ id: "provider-1", order_id: "order-1", status: "paid" });
    const timestamp = String(Math.floor(Date.now() / 1000));
    const canonical = buildCanonicalString({
      headers: { "x-api-timestamp": timestamp },
      query: {},
      body: rawBody,
    });
    const signature = await signWithTestKey(canonical);

    const result = await adapter.verifyWebhook({
      providerPaymentId: "provider-1",
      orderId: "order-1",
      status: "paid",
      rawBody,
      signature,
      timestamp,
    });

    expect(result).toBe(true);
  });

  it("returns false when signed by a different (non-matching) private key", async () => {
    const otherPair = await generateRsaKeyPair();
    const adapter = new FinikPaymentAdapter({
      ...CONFIG_BASE,
      rsaPrivateKeyPem: privateKeyPem,
      webhookPublicKeyPem: publicKeyPem,
    });
    const rawBody = JSON.stringify({ id: "provider-1", order_id: "order-1", status: "paid" });
    const timestamp = String(Math.floor(Date.now() / 1000));
    const canonical = buildCanonicalString({
      headers: { "x-api-timestamp": timestamp },
      query: {},
      body: rawBody,
    });

    const pemBody = otherPair.privateKeyPem
      .replace(/-----BEGIN [^-]+-----/, "")
      .replace(/-----END [^-]+-----/, "")
      .replace(/\s+/g, "");
    const binary = atob(pemBody);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const key = await crypto.subtle.importKey(
      "pkcs8",
      bytes.buffer,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const sig = await crypto.subtle.sign(
      { name: "RSASSA-PKCS1-v1_5" },
      key,
      new TextEncoder().encode(canonical),
    );
    const signature = bufferToBase64(sig);

    const result = await adapter.verifyWebhook({
      providerPaymentId: "provider-1",
      orderId: "order-1",
      status: "paid",
      rawBody,
      signature,
      timestamp,
    });

    expect(result).toBe(false);
  });

  it("returns false for a tampered body (signature no longer matches)", async () => {
    const adapter = new FinikPaymentAdapter({
      ...CONFIG_BASE,
      rsaPrivateKeyPem: privateKeyPem,
      webhookPublicKeyPem: publicKeyPem,
    });
    const originalBody = JSON.stringify({ id: "provider-1", order_id: "order-1", status: "paid" });
    const timestamp = String(Math.floor(Date.now() / 1000));
    const canonical = buildCanonicalString({
      headers: { "x-api-timestamp": timestamp },
      query: {},
      body: originalBody,
    });
    const signature = await signWithTestKey(canonical);
    const tamperedBody = JSON.stringify({
      id: "provider-1",
      order_id: "order-1",
      status: "failed",
    });

    const result = await adapter.verifyWebhook({
      providerPaymentId: "provider-1",
      orderId: "order-1",
      status: "failed",
      rawBody: tamperedBody,
      signature,
      timestamp,
    });

    expect(result).toBe(false);
  });

  it("returns false when the timestamp is older than the 10-second validity window", async () => {
    const adapter = new FinikPaymentAdapter({
      ...CONFIG_BASE,
      rsaPrivateKeyPem: privateKeyPem,
      webhookPublicKeyPem: publicKeyPem,
    });
    const rawBody = JSON.stringify({ id: "provider-1", order_id: "order-1", status: "paid" });
    const staleTimestamp = String(Math.floor(Date.now() / 1000) - 11);
    const canonical = buildCanonicalString({
      headers: { "x-api-timestamp": staleTimestamp },
      query: {},
      body: rawBody,
    });
    const signature = await signWithTestKey(canonical);

    const result = await adapter.verifyWebhook({
      providerPaymentId: "provider-1",
      orderId: "order-1",
      status: "paid",
      rawBody,
      signature,
      timestamp: staleTimestamp,
    });

    expect(result).toBe(false);
  });

  it("returns false when no signature is provided", async () => {
    const adapter = new FinikPaymentAdapter({
      ...CONFIG_BASE,
      rsaPrivateKeyPem: privateKeyPem,
      webhookPublicKeyPem: publicKeyPem,
    });

    const result = await adapter.verifyWebhook({
      providerPaymentId: "provider-1",
      orderId: "order-1",
      status: "paid",
      rawBody: "{}",
      signature: null,
      timestamp: String(Math.floor(Date.now() / 1000)),
    });

    expect(result).toBe(false);
  });

  it("returns false when no timestamp is provided", async () => {
    const adapter = new FinikPaymentAdapter({
      ...CONFIG_BASE,
      rsaPrivateKeyPem: privateKeyPem,
      webhookPublicKeyPem: publicKeyPem,
    });

    const result = await adapter.verifyWebhook({
      providerPaymentId: "provider-1",
      orderId: "order-1",
      status: "paid",
      rawBody: "{}",
      signature: "irrelevant",
      timestamp: null,
    });

    expect(result).toBe(false);
  });
});

describe("FinikPaymentAdapter.getStatus", () => {
  it("returns null on a 404 (unknown provider payment id)", async () => {
    stubFetch(async () => new Response("", { status: 404 }));
    const adapter = new FinikPaymentAdapter({
      ...CONFIG_BASE,
      rsaPrivateKeyPem: privateKeyPem,
      webhookPublicKeyPem: publicKeyPem,
    });

    const result = await adapter.getStatus("unknown-id");

    expect(result).toBeNull();
  });

  it("maps a successful response into a PaymentIntentDTO", async () => {
    stubFetch(
      async () =>
        new Response(
          JSON.stringify({
            id: "provider-1",
            order_id: "order-1",
            amount: 500,
            currency: "KGS",
            status: "paid",
            redirect_url: null,
          }),
          { status: 200 },
        ),
    );
    const adapter = new FinikPaymentAdapter({
      ...CONFIG_BASE,
      rsaPrivateKeyPem: privateKeyPem,
      webhookPublicKeyPem: publicKeyPem,
    });

    const result = await adapter.getStatus("provider-1");

    expect(result?.status).toBe("paid");
    expect(result?.orderId).toBe("order-1");
  });
});

describe("buildCanonicalString", () => {
  it("sorts header keys, query keys, and JSON body keys deterministically", () => {
    const a = buildCanonicalString({
      headers: { b: "2", a: "1" },
      query: { z: "9", y: "8" },
      body: JSON.stringify({ b: 2, a: 1 }),
    });
    const b = buildCanonicalString({
      headers: { a: "1", b: "2" },
      query: { y: "8", z: "9" },
      body: JSON.stringify({ a: 1, b: 2 }),
    });

    expect(a).toBe(b);
  });
});
