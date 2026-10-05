import { afterEach, describe, expect, it, vi } from "vitest";
import { TelegramBotApiAdapter } from "@server/adapters/telegram/telegram-bot-api.adapter";
import { RetryableError } from "@shared/lib/with-retry";

describe("TelegramBotApiAdapter", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("downloadFile", () => {
    /**
     * Задача №268 — real production failure: Telegram's file server
     * returned a real, present "content-type: application/octet-stream"
     * header for a downloaded photo (not omitted — genuinely present, just
     * generic/wrong), which used to pass straight through and fail
     * MediaUploadService's MIME allow-list check for every single photo
     * sent. contentType must always be "image/jpeg" regardless of
     * whatever the response header says.
     */
    it("always returns image/jpeg, ignoring a generic/wrong response content-type header", async () => {
      global.fetch = vi.fn(async (url: string | URL | Request) => {
        const urlStr = String(url);
        if (urlStr.includes("/getFile")) {
          return new Response(
            JSON.stringify({ ok: true, result: { file_path: "photos/file_1.jpg" } }),
            { status: 200 },
          );
        }
        return new Response(new Uint8Array([1, 2, 3]), {
          status: 200,
          headers: { "content-type": "application/octet-stream" },
        });
      }) as unknown as typeof fetch;

      const adapter = new TelegramBotApiAdapter({ botToken: "test-token" });
      const result = await adapter.downloadFile("file-id-1");

      expect(result.contentType).toBe("image/jpeg");
      expect(result.data).toBeInstanceOf(Buffer);
    });

    it("still returns image/jpeg when the response omits content-type entirely", async () => {
      global.fetch = vi.fn(async (url: string | URL | Request) => {
        const urlStr = String(url);
        if (urlStr.includes("/getFile")) {
          return new Response(
            JSON.stringify({ ok: true, result: { file_path: "photos/file_2.jpg" } }),
            { status: 200 },
          );
        }
        return new Response(new Uint8Array([1, 2, 3]), { status: 200 });
      }) as unknown as typeof fetch;

      const adapter = new TelegramBotApiAdapter({ botToken: "test-token" });
      const result = await adapter.downloadFile("file-id-2");

      expect(result.contentType).toBe("image/jpeg");
    });

    it("throws when getFile's response has no file_path", async () => {
      global.fetch = vi.fn(
        async () => new Response(JSON.stringify({ ok: true, result: {} }), { status: 200 }),
      ) as unknown as typeof fetch;

      const adapter = new TelegramBotApiAdapter({ botToken: "test-token" });
      await expect(adapter.downloadFile("file-id-3")).rejects.toThrow(
        "Telegram getFile response contained no file_path",
      );
    });
  });

  describe("sendMessage", () => {
    it("posts chat_id and text as JSON", async () => {
      const fetchMock = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
        expect(JSON.parse(init!.body as string)).toEqual({ chat_id: 123, text: "hello" });
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      });
      global.fetch = fetchMock as unknown as typeof fetch;

      const adapter = new TelegramBotApiAdapter({ botToken: "test-token" });
      await adapter.sendMessage(123, "hello");

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("throws on a non-ok response", async () => {
      global.fetch = vi.fn(
        async () => new Response("Bad Request", { status: 400 }),
      ) as unknown as typeof fetch;

      const adapter = new TelegramBotApiAdapter({ botToken: "test-token" });
      await expect(adapter.sendMessage(123, "hello")).rejects.toThrow(
        "Telegram sendMessage failed: HTTP 400",
      );
    });

    it("sends plain text — no parse_mode, so nothing in the text needs escaping", async () => {
      const fetchMock = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
        expect(JSON.parse(init!.body as string)).not.toHaveProperty("parse_mode");
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      });
      global.fetch = fetchMock as unknown as typeof fetch;

      await new TelegramBotApiAdapter({ botToken: "t" }).sendMessage(1, "*_[]<b>&");
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it.each([429, 500, 502])("marks HTTP %i as retryable", async (status) => {
      global.fetch = vi.fn(async () => new Response("", { status })) as unknown as typeof fetch;
      await expect(
        new TelegramBotApiAdapter({ botToken: "t" }).sendMessage(1, "x"),
      ).rejects.toBeInstanceOf(RetryableError);
    });

    it.each([400, 403])("does not retry HTTP %i (blocked bot, bad chat)", async (status) => {
      global.fetch = vi.fn(async () => new Response("", { status })) as unknown as typeof fetch;
      const error = await new TelegramBotApiAdapter({ botToken: "t" })
        .sendMessage(1, "x")
        .catch((e: unknown) => e);
      expect(error).toBeInstanceOf(Error);
      expect(error).not.toBeInstanceOf(RetryableError);
    });

    it("marks a network failure as retryable, but not a timeout", async () => {
      global.fetch = vi.fn(async () => {
        throw new TypeError("fetch failed");
      }) as unknown as typeof fetch;
      await expect(
        new TelegramBotApiAdapter({ botToken: "t" }).sendMessage(1, "x"),
      ).rejects.toBeInstanceOf(RetryableError);

      global.fetch = vi.fn(async () => {
        throw new DOMException("The operation timed out.", "TimeoutError");
      }) as unknown as typeof fetch;
      const error = await new TelegramBotApiAdapter({ botToken: "t" })
        .sendMessage(1, "x")
        .catch((e: unknown) => e);
      expect(error).not.toBeInstanceOf(RetryableError);
      expect(String(error)).toContain("timeout");
    });
  });
});
