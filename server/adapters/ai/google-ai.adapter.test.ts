import { afterEach, describe, expect, it, vi } from "vitest";
import { GoogleAiAdapter } from "@server/adapters/ai/google-ai.adapter";

describe("GoogleAiAdapter", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("sends the API key via the x-goog-api-key header and returns the model's text", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      expect((init?.headers as Record<string, string>)["x-goog-api-key"]).toBe("test-key");
      return new Response(
        JSON.stringify({
          candidates: [{ content: { parts: [{ text: "Hello" }] } }],
        }),
        { status: 200 },
      );
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const adapter = new GoogleAiAdapter({ apiKey: "test-key" });
    const result = await adapter.translateText({ text: "Привет", targetLanguage: "en" });

    expect(result).toEqual({ translatedText: "Hello", detectedSourceLanguage: null });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("echoes back the requested sourceLanguage as detectedSourceLanguage when provided", async () => {
    global.fetch = vi.fn(
      async () =>
        new Response(
          JSON.stringify({ candidates: [{ content: { parts: [{ text: "Hello" }] } }] }),
          { status: 200 },
        ),
    ) as unknown as typeof fetch;

    const adapter = new GoogleAiAdapter({ apiKey: "test-key" });
    const result = await adapter.translateText({
      text: "Привет",
      targetLanguage: "en",
      sourceLanguage: "ru",
    });

    expect(result.detectedSourceLanguage).toBe("ru");
  });

  it("throws when the HTTP response is not ok", async () => {
    global.fetch = vi.fn(
      async () => new Response("forbidden", { status: 403 }),
    ) as unknown as typeof fetch;

    const adapter = new GoogleAiAdapter({ apiKey: "bad-key" });

    await expect(adapter.translateText({ text: "Привет", targetLanguage: "en" })).rejects.toThrow(
      /HTTP 403/,
    );
  });

  it("throws when the response has no candidate text", async () => {
    global.fetch = vi.fn(
      async () => new Response(JSON.stringify({ candidates: [] }), { status: 200 }),
    ) as unknown as typeof fetch;

    const adapter = new GoogleAiAdapter({ apiKey: "test-key" });

    await expect(adapter.translateText({ text: "Привет", targetLanguage: "en" })).rejects.toThrow(
      "no translated text",
    );
  });
});
