import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { FinikPaymentAdapter } from "@server/adapters/payment/finik.adapter";
import { Signer } from "@mancho.devs/authorizer";
import { RetryableError } from "@shared/lib/with-retry";
import { BRAND } from "@/config/brand";

let privateKeyPem: string;
let publicKeyPem: string;

const CONFIG_BASE = {
  apiKey: "test-api-key",
  merchantId: "merchant-1",
  environment: "beta" as const,
};
const BETA_ENDPOINT = "https://beta.api.acquiring.averspay.kg/v1/payment";
const WEBHOOK_HOST = "mesnyibazar.com";
const WEBHOOK_PATH = "/api/webhooks/finik";

const REQUEST = {
  orderId: "order-1",
  orderNumber: 1001,
  amount: 500,
  currency: "KGS",
  idempotencyKey: "idem-1",
  returnUrl: "https://mesnyibazar.com/order-success",
  webhookUrl: "https://mesnyibazar.com/api/webhooks/finik",
};

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

/** Signs a webhook body exactly the way the real Finik server would, using the same official library our adapter verifies against. */
async function signWebhookBody(
  body: Record<string, unknown>,
  timestamp: string,
  privateKey: string,
): Promise<string> {
  const signer = new Signer({
    body,
    headers: { Host: WEBHOOK_HOST, "x-api-timestamp": timestamp },
    httpMethod: "POST",
    path: WEBHOOK_PATH,
    queryStringParameters: null,
  });
  return signer.sign(privateKey);
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
  it("POSTs to the official Beta endpoint with redirect:manual and signature/x-api-key/x-api-timestamp headers", async () => {
    const fetchSpy = stubFetch(
      async () =>
        new Response(null, {
          status: 302,
          headers: { location: "https://checkout.finik.kg/pay/abc" },
        }),
    );
    const adapter = new FinikPaymentAdapter({
      ...CONFIG_BASE,
      rsaPrivateKeyPem: privateKeyPem,
      webhookPublicKeyPem: publicKeyPem,
    });

    await adapter.createPayment(REQUEST);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe(BETA_ENDPOINT);
    expect(init?.method).toBe("POST");
    expect(init?.redirect).toBe("manual");
    const headers = init?.headers as Record<string, string>;
    expect(headers["x-api-key"]).toBe("test-api-key");
    expect(typeof headers["x-api-timestamp"]).toBe("string");
    expect(typeof headers.signature).toBe("string");
  });

  it("sends exactly the confirmed-working Finik Playground body shape (Промпт №081)", async () => {
    const fetchSpy = stubFetch(
      async () =>
        new Response(null, {
          status: 302,
          headers: { location: "https://checkout.finik.kg/pay/abc" },
        }),
    );
    const adapter = new FinikPaymentAdapter({
      ...CONFIG_BASE,
      rsaPrivateKeyPem: privateKeyPem,
      webhookPublicKeyPem: publicKeyPem,
    });

    await adapter.createPayment(REQUEST);

    const [, init] = fetchSpy.mock.calls[0];
    const sentBody = JSON.parse(init?.body as string);
    expect(sentBody).toEqual({
      Amount: 500,
      CardType: "FINIK_QR",
      Data: {
        accountId: "merchant-1",
        name_en: BRAND.name,
      },
      PaymentId: "idem-1",
      RedirectUrl: "https://mesnyibazar.com/order-success",
    });
  });

  it("uses the checkout idempotency key as both PaymentId and the resulting providerPaymentId — no response-body parsing needed", async () => {
    stubFetch(
      async () =>
        new Response(null, {
          status: 302,
          headers: { location: "https://checkout.finik.kg/pay/abc" },
        }),
    );
    const adapter = new FinikPaymentAdapter({
      ...CONFIG_BASE,
      rsaPrivateKeyPem: privateKeyPem,
      webhookPublicKeyPem: publicKeyPem,
    });

    const result = await adapter.createPayment(REQUEST);

    expect(result.providerPaymentId).toBe("idem-1");
    expect(result.id).toBe("idem-1");
    expect(result.paymentUrl).toBe("https://checkout.finik.kg/pay/abc");
  });

  it("throws when the response is a redirect with no Location header", async () => {
    stubFetch(async () => new Response(null, { status: 302 }));
    const adapter = new FinikPaymentAdapter({
      ...CONFIG_BASE,
      rsaPrivateKeyPem: privateKeyPem,
      webhookPublicKeyPem: publicKeyPem,
    });

    await expect(adapter.createPayment(REQUEST)).rejects.toMatchObject({
      message: expect.stringContaining("Location"),
    });
  });

  it("throws a non-retryable error with a distinct message on 401", async () => {
    stubFetch(async () => new Response("", { status: 401 }));
    const adapter = new FinikPaymentAdapter({
      ...CONFIG_BASE,
      rsaPrivateKeyPem: privateKeyPem,
      webhookPublicKeyPem: publicKeyPem,
    });

    await expect(adapter.createPayment(REQUEST)).rejects.toMatchObject({
      message: expect.stringContaining("authentication/authorization"),
    });
  });

  it("throws a non-retryable error on 403", async () => {
    stubFetch(async () => new Response("", { status: 403 }));
    const adapter = new FinikPaymentAdapter({
      ...CONFIG_BASE,
      rsaPrivateKeyPem: privateKeyPem,
      webhookPublicKeyPem: publicKeyPem,
    });

    await expect(adapter.createPayment(REQUEST)).rejects.not.toBeInstanceOf(RetryableError);
  });

  it("throws a non-retryable error on 400", async () => {
    stubFetch(async () => new Response("", { status: 400 }));
    const adapter = new FinikPaymentAdapter({
      ...CONFIG_BASE,
      rsaPrivateKeyPem: privateKeyPem,
      webhookPublicKeyPem: publicKeyPem,
    });

    await expect(adapter.createPayment(REQUEST)).rejects.not.toBeInstanceOf(RetryableError);
  });

  it("throws a RetryableError on a 5xx response", async () => {
    stubFetch(async () => new Response("", { status: 503 }));
    const adapter = new FinikPaymentAdapter({
      ...CONFIG_BASE,
      rsaPrivateKeyPem: privateKeyPem,
      webhookPublicKeyPem: publicKeyPem,
    });

    await expect(adapter.createPayment(REQUEST)).rejects.toBeInstanceOf(RetryableError);
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

    await expect(adapter.createPayment(REQUEST)).rejects.toBeInstanceOf(RetryableError);
  });

  it("POSTs to the Production endpoint when configured for production", async () => {
    const fetchSpy = stubFetch(
      async () =>
        new Response(null, {
          status: 302,
          headers: { location: "https://checkout.finik.kg/pay/abc" },
        }),
    );
    const adapter = new FinikPaymentAdapter({
      ...CONFIG_BASE,
      environment: "production",
      rsaPrivateKeyPem: privateKeyPem,
      webhookPublicKeyPem: publicKeyPem,
    });

    await adapter.createPayment(REQUEST);

    expect(fetchSpy.mock.calls[0][0]).toBe("https://api.acquiring.averspay.kg/v1/payment");
  });
});

describe("FinikPaymentAdapter.verifyWebhook (@mancho.devs/authorizer Signer, RSA SHA256)", () => {
  it("returns true for a signature genuinely produced by the matching private key", async () => {
    const adapter = new FinikPaymentAdapter({
      ...CONFIG_BASE,
      rsaPrivateKeyPem: privateKeyPem,
      webhookPublicKeyPem: publicKeyPem,
    });
    const body = { id: "txn-1", status: "success", fields: { paymentId: "idem-1" } };
    const rawBody = JSON.stringify(body);
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = await signWebhookBody(body, timestamp, privateKeyPem);

    const result = await adapter.verifyWebhook({
      rawBody,
      signature,
      httpMethod: "POST",
      path: WEBHOOK_PATH,
      host: WEBHOOK_HOST,
      headers: { "x-api-timestamp": timestamp },
      queryStringParameters: null,
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
    const body = { id: "txn-1", status: "success", fields: { paymentId: "idem-1" } };
    const rawBody = JSON.stringify(body);
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = await signWebhookBody(body, timestamp, otherPair.privateKeyPem);

    const result = await adapter.verifyWebhook({
      rawBody,
      signature,
      httpMethod: "POST",
      path: WEBHOOK_PATH,
      host: WEBHOOK_HOST,
      headers: { "x-api-timestamp": timestamp },
      queryStringParameters: null,
    });

    expect(result).toBe(false);
  });

  it("returns false for a tampered body (signature no longer matches)", async () => {
    const adapter = new FinikPaymentAdapter({
      ...CONFIG_BASE,
      rsaPrivateKeyPem: privateKeyPem,
      webhookPublicKeyPem: publicKeyPem,
    });
    const originalBody = { id: "txn-1", status: "success", fields: { paymentId: "idem-1" } };
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = await signWebhookBody(originalBody, timestamp, privateKeyPem);
    const tamperedRawBody = JSON.stringify({
      id: "txn-1",
      status: "success",
      fields: { paymentId: "someone-elses-payment" },
    });

    const result = await adapter.verifyWebhook({
      rawBody: tamperedRawBody,
      signature,
      httpMethod: "POST",
      path: WEBHOOK_PATH,
      host: WEBHOOK_HOST,
      headers: { "x-api-timestamp": timestamp },
      queryStringParameters: null,
    });

    expect(result).toBe(false);
  });

  it("returns false when the timestamp is older than the 10-second validity window", async () => {
    const adapter = new FinikPaymentAdapter({
      ...CONFIG_BASE,
      rsaPrivateKeyPem: privateKeyPem,
      webhookPublicKeyPem: publicKeyPem,
    });
    const body = { id: "txn-1", status: "success", fields: { paymentId: "idem-1" } };
    const rawBody = JSON.stringify(body);
    const staleTimestamp = String(Math.floor(Date.now() / 1000) - 11);
    const signature = await signWebhookBody(body, staleTimestamp, privateKeyPem);

    const result = await adapter.verifyWebhook({
      rawBody,
      signature,
      httpMethod: "POST",
      path: WEBHOOK_PATH,
      host: WEBHOOK_HOST,
      headers: { "x-api-timestamp": staleTimestamp },
      queryStringParameters: null,
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
      rawBody: "{}",
      signature: null,
      httpMethod: "POST",
      path: WEBHOOK_PATH,
      host: WEBHOOK_HOST,
      headers: { "x-api-timestamp": String(Math.floor(Date.now() / 1000)) },
      queryStringParameters: null,
    });

    expect(result).toBe(false);
  });

  it("returns false when no x-api-timestamp header is provided", async () => {
    const adapter = new FinikPaymentAdapter({
      ...CONFIG_BASE,
      rsaPrivateKeyPem: privateKeyPem,
      webhookPublicKeyPem: publicKeyPem,
    });

    const result = await adapter.verifyWebhook({
      rawBody: "{}",
      signature: "irrelevant",
      httpMethod: "POST",
      path: WEBHOOK_PATH,
      host: WEBHOOK_HOST,
      headers: {},
      queryStringParameters: null,
    });

    expect(result).toBe(false);
  });
});

describe("FinikPaymentAdapter.getStatus", () => {
  it("always returns null — Finik's documented API has no status-check endpoint (Промпт №080)", async () => {
    const adapter = new FinikPaymentAdapter({
      ...CONFIG_BASE,
      rsaPrivateKeyPem: privateKeyPem,
      webhookPublicKeyPem: publicKeyPem,
    });

    const result = await adapter.getStatus("provider-1");

    expect(result).toBeNull();
  });

  it("never makes a network call", async () => {
    const fetchSpy = stubFetch(async () => {
      throw new Error("getStatus must not call fetch — no documented endpoint exists");
    });
    const adapter = new FinikPaymentAdapter({
      ...CONFIG_BASE,
      rsaPrivateKeyPem: privateKeyPem,
      webhookPublicKeyPem: publicKeyPem,
    });

    await adapter.getStatus("provider-1");

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
