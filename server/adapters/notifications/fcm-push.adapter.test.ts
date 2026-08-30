import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { FcmPushAdapter } from "@server/adapters/notifications/fcm-push.adapter";
import type { GoogleServiceAccount } from "@server/adapters/notifications/google-service-account-jwt";
import type { DeviceTokenDTO, IDeviceTokenRepository } from "@server/ports/device-token.repository";

let privateKeyPem: string;

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

beforeAll(async () => {
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
  privateKeyPem = toPem(privateKeyBuffer, "PRIVATE KEY");
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function makeAccount(overrides: Partial<GoogleServiceAccount> = {}): GoogleServiceAccount {
  return {
    project_id: "mestny-bazar",
    // Unique per test so the module-level access-token cache never leaks between tests.
    client_email: `sa-${Math.random()}@mestny-bazar.iam.gserviceaccount.com`,
    private_key: privateKeyPem,
    ...overrides,
  };
}

function fakeDeviceTokenRepo(
  overrides: Partial<IDeviceTokenRepository> = {},
): IDeviceTokenRepository {
  return {
    upsert: vi.fn(async () => {}),
    listByUserId: vi.fn(async () => []),
    deleteByToken: vi.fn(async () => {}),
    listDistinctUserIds: vi.fn(async () => []),
    ...overrides,
  };
}

function stubFetch(handlers: Record<string, () => Promise<Response>>) {
  const spy = vi.fn(async (input: RequestInfo | URL, _init?: RequestInit) => {
    const url = String(input);
    for (const [prefix, handler] of Object.entries(handlers)) {
      if (url.startsWith(prefix)) return handler();
    }
    throw new Error(`Unexpected fetch to ${url}`);
  });
  vi.stubGlobal("fetch", spy);
  return spy;
}

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const oauthOk = async () =>
  Response.json({ access_token: "access-token", expires_in: 3600, token_type: "Bearer" });

describe("FcmPushAdapter.sendToUser", () => {
  it("does nothing when the user has no device tokens (no token fetch, no FCM call)", async () => {
    const deviceTokens = fakeDeviceTokenRepo({ listByUserId: vi.fn(async () => []) });
    const fetchSpy = stubFetch({ [TOKEN_ENDPOINT]: oauthOk });
    const adapter = new FcmPushAdapter(makeAccount(), deviceTokens);

    await adapter.sendToUser("user-1", { title: "T", body: "B" });

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("sends one FCM v1 request per registered device token, with the order data payload", async () => {
    const tokens: DeviceTokenDTO[] = [
      { token: "token-android", platform: "android" },
      { token: "token-ios", platform: "ios" },
    ];
    const deviceTokens = fakeDeviceTokenRepo({ listByUserId: vi.fn(async () => tokens) });
    const account = makeAccount();
    const sendCalls: unknown[] = [];
    const fetchSpy = stubFetch({
      [TOKEN_ENDPOINT]: oauthOk,
      [`https://fcm.googleapis.com/v1/projects/${account.project_id}/messages:send`]: async () =>
        Response.json({ name: "projects/mestny-bazar/messages/msg-1" }),
    });
    // Capture request bodies via the same spy's call args (stubFetch already logs the call).
    const adapter = new FcmPushAdapter(account, deviceTokens);

    await adapter.sendToUser("user-1", {
      title: "Заказ подтверждён",
      body: "Заказ №42 принят в обработку",
      data: { orderId: "order-1", orderNumber: "42" },
    });

    expect(deviceTokens.listByUserId).toHaveBeenCalledWith("user-1");
    const sendRequests = fetchSpy.mock.calls.filter(([url]) =>
      String(url).includes("messages:send"),
    );
    expect(sendRequests).toHaveLength(2);

    const [, init] = sendRequests[0];
    const headers = init?.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer access-token");
    const body = JSON.parse(init?.body as string);
    expect(body.message.notification).toEqual({
      title: "Заказ подтверждён",
      body: "Заказ №42 принят в обработку",
    });
    expect(body.message.data).toEqual({ orderId: "order-1", orderNumber: "42" });
    const sentTokens = sendRequests.map(
      ([, i]) => JSON.parse((i as RequestInit).body as string).message.token,
    );
    expect(new Set(sentTokens)).toEqual(new Set(["token-android", "token-ios"]));
    void sendCalls;
  });

  it("deletes the token and does not throw when FCM reports UNREGISTERED (status NOT_FOUND)", async () => {
    const deviceTokens = fakeDeviceTokenRepo({
      listByUserId: vi.fn(async () => [{ token: "dead-token", platform: "android" as const }]),
      deleteByToken: vi.fn(async () => {}),
    });
    const account = makeAccount();
    stubFetch({
      [TOKEN_ENDPOINT]: oauthOk,
      [`https://fcm.googleapis.com/v1/projects/${account.project_id}/messages:send`]: async () =>
        new Response(
          JSON.stringify({
            error: {
              code: 404,
              status: "NOT_FOUND",
              details: [
                {
                  "@type": "type.googleapis.com/google.firebase.fcm.v1.FcmError",
                  errorCode: "UNREGISTERED",
                },
              ],
            },
          }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        ),
    });
    const adapter = new FcmPushAdapter(account, deviceTokens);

    await expect(adapter.sendToUser("user-1", { title: "T", body: "B" })).resolves.toBeUndefined();

    expect(deviceTokens.deleteByToken).toHaveBeenCalledWith("dead-token");
  });

  it("deletes the token on INVALID_ARGUMENT (malformed token)", async () => {
    const deviceTokens = fakeDeviceTokenRepo({
      listByUserId: vi.fn(async () => [{ token: "malformed-token", platform: "android" as const }]),
      deleteByToken: vi.fn(async () => {}),
    });
    const account = makeAccount();
    stubFetch({
      [TOKEN_ENDPOINT]: oauthOk,
      [`https://fcm.googleapis.com/v1/projects/${account.project_id}/messages:send`]: async () =>
        new Response(JSON.stringify({ error: { code: 400, status: "INVALID_ARGUMENT" } }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }),
    });
    const adapter = new FcmPushAdapter(account, deviceTokens);

    await adapter.sendToUser("user-1", { title: "T", body: "B" });

    expect(deviceTokens.deleteByToken).toHaveBeenCalledWith("malformed-token");
  });

  it("does not delete the token and does not throw on a transient/other FCM error (e.g. 500 UNAVAILABLE)", async () => {
    const deviceTokens = fakeDeviceTokenRepo({
      listByUserId: vi.fn(async () => [{ token: "some-token", platform: "android" as const }]),
      deleteByToken: vi.fn(async () => {}),
    });
    const account = makeAccount();
    stubFetch({
      [TOKEN_ENDPOINT]: oauthOk,
      [`https://fcm.googleapis.com/v1/projects/${account.project_id}/messages:send`]: async () =>
        new Response(JSON.stringify({ error: { code: 503, status: "UNAVAILABLE" } }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }),
    });
    const adapter = new FcmPushAdapter(account, deviceTokens);

    await expect(adapter.sendToUser("user-1", { title: "T", body: "B" })).resolves.toBeUndefined();

    expect(deviceTokens.deleteByToken).not.toHaveBeenCalled();
  });

  it("never throws even when the device-token lookup itself fails", async () => {
    const deviceTokens = fakeDeviceTokenRepo({
      listByUserId: vi.fn(async () => {
        throw new Error("db down");
      }),
    });
    const adapter = new FcmPushAdapter(makeAccount(), deviceTokens);

    await expect(adapter.sendToUser("user-1", { title: "T", body: "B" })).resolves.toBeUndefined();
  });

  it("never throws when fetch itself rejects (network failure) for one token", async () => {
    const deviceTokens = fakeDeviceTokenRepo({
      listByUserId: vi.fn(async () => [{ token: "token-1", platform: "android" as const }]),
    });
    const account = makeAccount();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        if (String(input) === TOKEN_ENDPOINT) return oauthOk();
        throw new TypeError("network error");
      }),
    );
    const adapter = new FcmPushAdapter(account, deviceTokens);

    await expect(adapter.sendToUser("user-1", { title: "T", body: "B" })).resolves.toBeUndefined();
  });
});
