import { afterEach, describe, expect, it, vi } from "vitest";
import { TelegramBotApiAdapter } from "@server/adapters/telegram/telegram-bot-api.adapter";

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
  });
});
