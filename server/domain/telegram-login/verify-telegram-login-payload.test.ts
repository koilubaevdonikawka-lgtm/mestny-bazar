import { describe, expect, it } from "vitest";
import type { TelegramLoginPayload } from "@shared/contracts/telegram-login";
import {
  InvalidTelegramSignatureError,
  StaleTelegramAuthError,
} from "@server/domain/telegram-login/telegram-login.errors";
import { verifyTelegramLoginPayload } from "@server/domain/telegram-login/verify-telegram-login-payload";

const BOT_TOKEN = "123456:test-bot-token";

function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Reference implementation of Telegram's own signing algorithm, independent of the module under test, so a real matching hash can be produced for fixtures. */
async function signPayload(
  payload: Omit<TelegramLoginPayload, "hash">,
  botToken: string,
): Promise<string> {
  const dataCheckString = Object.entries(payload)
    .filter(([, value]) => value !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const secretKeyBytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(botToken));
  const hmacKey = await crypto.subtle.importKey(
    "raw",
    secretKeyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    hmacKey,
    new TextEncoder().encode(dataCheckString),
  );
  return toHex(signature);
}

async function makePayload(
  overrides: Partial<Omit<TelegramLoginPayload, "hash">> = {},
  botToken = BOT_TOKEN,
): Promise<TelegramLoginPayload> {
  const base = {
    id: 424242,
    first_name: "Дания",
    username: "daniyar_test",
    auth_date: Math.floor(Date.now() / 1000),
    ...overrides,
  };
  const hash = await signPayload(base, botToken);
  return { ...base, hash };
}

describe("verifyTelegramLoginPayload", () => {
  it("accepts a payload correctly signed with the real bot token", async () => {
    const payload = await makePayload();
    await expect(verifyTelegramLoginPayload(payload, BOT_TOKEN)).resolves.toBeUndefined();
  });

  it("accepts a payload with only the required fields (last_name/username/photo_url omitted)", async () => {
    const payload = await makePayload({ username: undefined });
    await expect(verifyTelegramLoginPayload(payload, BOT_TOKEN)).resolves.toBeUndefined();
  });

  it("rejects a payload signed with a different bot token", async () => {
    const payload = await makePayload({}, "999999:someone-elses-token");
    await expect(verifyTelegramLoginPayload(payload, BOT_TOKEN)).rejects.toBeInstanceOf(
      InvalidTelegramSignatureError,
    );
  });

  it("rejects a tampered field even though the hash itself is untouched", async () => {
    const payload = await makePayload();
    const tampered = { ...payload, first_name: "Attacker" };
    await expect(verifyTelegramLoginPayload(tampered, BOT_TOKEN)).rejects.toBeInstanceOf(
      InvalidTelegramSignatureError,
    );
  });

  it("rejects an auth_date older than the 5-minute replay window", async () => {
    const sixMinutesAgo = Math.floor(Date.now() / 1000) - 6 * 60;
    const payload = await makePayload({ auth_date: sixMinutesAgo });
    await expect(verifyTelegramLoginPayload(payload, BOT_TOKEN)).rejects.toBeInstanceOf(
      StaleTelegramAuthError,
    );
  });

  it("accepts an auth_date just inside the 5-minute window", async () => {
    const fourMinutesAgo = Math.floor(Date.now() / 1000) - 4 * 60;
    const payload = await makePayload({ auth_date: fourMinutesAgo });
    await expect(verifyTelegramLoginPayload(payload, BOT_TOKEN)).resolves.toBeUndefined();
  });

  it("rejects an auth_date implausibly far in the future", async () => {
    const inTenMinutes = Math.floor(Date.now() / 1000) + 10 * 60;
    const payload = await makePayload({ auth_date: inTenMinutes });
    await expect(verifyTelegramLoginPayload(payload, BOT_TOKEN)).rejects.toBeInstanceOf(
      StaleTelegramAuthError,
    );
  });

  it("checks freshness against the injected `now`, not the real clock", async () => {
    const authDate = Math.floor(Date.now() / 1000) - 1000;
    const payload = await makePayload({ auth_date: authDate });
    await expect(
      verifyTelegramLoginPayload(payload, BOT_TOKEN, { now: (authDate + 60) * 1000 }),
    ).resolves.toBeUndefined();
  });
});
