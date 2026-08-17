import { afterEach, describe, expect, it, vi } from "vitest";
import { GoogleAiImageAdapter } from "@server/adapters/ai/google-ai-image.adapter";

describe("GoogleAiImageAdapter", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("sends the input image as an inlineData part and returns the output image bytes", async () => {
    const outputBase64 = Buffer.from("processed-image-bytes").toString("base64");
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(init?.body as string);
      expect(body.contents[0].parts[1].inlineData.mimeType).toBe("image/png");
      expect(body.contents[0].parts[1].inlineData.data).toBe(
        Buffer.from("input-bytes").toString("base64"),
      );
      expect((init?.headers as Record<string, string>)["x-goog-api-key"]).toBe("test-key");
      return new Response(
        JSON.stringify({
          candidates: [
            { content: { parts: [{ inlineData: { mimeType: "image/png", data: outputBase64 } }] } },
          ],
        }),
        { status: 200 },
      );
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const adapter = new GoogleAiImageAdapter({ apiKey: "test-key" });
    const result = await adapter.removeBackground({
      imageData: Buffer.from("input-bytes"),
      mimeType: "image/png",
    });

    expect(result.imageData.toString()).toBe("processed-image-bytes");
    expect(result.mimeType).toBe("image/png");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throws when the HTTP response is not ok", async () => {
    global.fetch = vi.fn(
      async () => new Response("forbidden", { status: 403 }),
    ) as unknown as typeof fetch;

    const adapter = new GoogleAiImageAdapter({ apiKey: "bad-key" });

    await expect(
      adapter.removeBackground({ imageData: Buffer.from("x"), mimeType: "image/png" }),
    ).rejects.toThrow(/HTTP 403/);
  });

  it("throws when the response has no output image", async () => {
    global.fetch = vi.fn(
      async () => new Response(JSON.stringify({ candidates: [] }), { status: 200 }),
    ) as unknown as typeof fetch;

    const adapter = new GoogleAiImageAdapter({ apiKey: "test-key" });

    await expect(
      adapter.removeBackground({ imageData: Buffer.from("x"), mimeType: "image/png" }),
    ).rejects.toThrow("no output image");
  });
});
