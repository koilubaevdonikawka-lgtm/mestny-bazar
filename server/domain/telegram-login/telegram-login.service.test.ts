import { describe, expect, it, vi } from "vitest";
import type { TelegramLoginPayload } from "@shared/contracts/telegram-login";
import type {
  ITelegramIdentityRepository,
  TelegramIdentity,
} from "@server/ports/telegram-identity.repository";
import { InvalidTelegramSignatureError } from "@server/domain/telegram-login/telegram-login.errors";
import { TelegramLoginService } from "@server/domain/telegram-login/telegram-login.service";

const BOT_TOKEN = "123456:test-bot-token";

function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

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
): Promise<TelegramLoginPayload> {
  const base = {
    id: 424242,
    first_name: "Дания",
    last_name: "К",
    username: "daniyar_test",
    photo_url: "https://t.me/i/userpic/320/example.jpg",
    auth_date: Math.floor(Date.now() / 1000),
    ...overrides,
  };
  const hash = await signPayload(base, BOT_TOKEN);
  return { ...base, hash };
}

function fakeIdentities(): ITelegramIdentityRepository & {
  issueSession: ReturnType<typeof vi.fn>;
} {
  return {
    issueSession: vi.fn(async () => ({
      tokenHash: "hashed-token-1",
      verificationType: "magiclink",
    })),
  };
}

describe("TelegramLoginService.signIn", () => {
  it("verifies the payload and passes every profile field through to the repository", async () => {
    const identities = fakeIdentities();
    const service = new TelegramLoginService(identities);
    const payload = await makePayload();

    const result = await service.signIn(payload, BOT_TOKEN);

    expect(result).toEqual({ tokenHash: "hashed-token-1", verificationType: "magiclink" });
    const passed = identities.issueSession.mock.calls[0][0] as TelegramIdentity;
    expect(passed).toEqual({
      telegramId: payload.id,
      firstName: "Дания",
      lastName: "К",
      username: "daniyar_test",
      photoUrl: payload.photo_url,
    });
  });

  it("never calls the repository when the signature is invalid", async () => {
    const identities = fakeIdentities();
    const service = new TelegramLoginService(identities);
    const payload = await makePayload();
    const tampered = { ...payload, id: 999999 };

    await expect(service.signIn(tampered, BOT_TOKEN)).rejects.toBeInstanceOf(
      InvalidTelegramSignatureError,
    );
    expect(identities.issueSession).not.toHaveBeenCalled();
  });
});
