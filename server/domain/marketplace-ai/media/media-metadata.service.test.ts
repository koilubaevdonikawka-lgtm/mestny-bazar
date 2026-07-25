import { afterEach, describe, expect, it, vi } from "vitest";
import { MediaMetadataService } from "@server/domain/marketplace-ai/media/media-metadata.service";

describe("MediaMetadataService.resolveAssets", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("bounds each image fetch with an abort signal instead of waiting forever", async () => {
    const fetchMock = vi.fn(async (_url: string, options?: RequestInit) => {
      expect(options?.signal).toBeInstanceOf(AbortSignal);
      throw new Error("simulated abort");
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const service = new MediaMetadataService();
    const result = await service.resolveAssets([
      { id: "product-1", url: "https://slow.example/photo.jpg" },
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    // A failed/aborted fetch must degrade gracefully (hash of the URL, null
    // dimensions) rather than hanging or rejecting resolveAssets.
    expect(result).toEqual([
      expect.objectContaining({
        id: "product-1",
        url: "https://slow.example/photo.jpg",
        width: null,
        height: null,
      }),
    ]);
  });

  it("rejects based on a declared Content-Length before reading any body bytes", async () => {
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        controller.enqueue(new Uint8Array(10));
        controller.close();
      },
    });
    const response = new Response(stream, {
      status: 200,
      headers: { "content-length": String(50 * 1024 * 1024) },
    });
    global.fetch = vi.fn(async () => response) as unknown as typeof fetch;

    const service = new MediaMetadataService();
    const result = await service.resolveAssets([
      { id: "product-1", url: "https://big.example/photo.jpg" },
    ]);

    expect(result[0]).toMatchObject({ id: "product-1", width: null, height: null });
    // bodyUsed is the spec-defined signal that a consumer actually started
    // reading the stream (via getReader().read()) — unlike a custom flag set
    // from inside pull(), which fires on stream creation regardless of
    // whether anything ever reads from it, this proves the body was never
    // consumed by our code.
    expect(response.bodyUsed).toBe(false);
  });

  it("stops reading once the running total crosses the size cap, without buffering the whole body", async () => {
    const CHUNK_SIZE = 1024 * 1024; // 1MB
    const TOTAL_CHUNKS = 20; // 20MB total if fully consumed — well over the 10MB cap
    let chunksProduced = 0;

    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        if (chunksProduced >= TOTAL_CHUNKS) {
          controller.close();
          return;
        }
        chunksProduced += 1;
        controller.enqueue(new Uint8Array(CHUNK_SIZE));
      },
    });
    // No content-length header — the server didn't declare a size, so the
    // only protection is the streaming byte-count check itself.
    const response = new Response(stream, { status: 200 });
    global.fetch = vi.fn(async () => response) as unknown as typeof fetch;

    const service = new MediaMetadataService();
    const result = await service.resolveAssets([
      { id: "product-1", url: "https://big.example/photo.jpg" },
    ]);

    expect(result[0]).toMatchObject({ id: "product-1", width: null, height: null });
    expect(chunksProduced).toBeLessThan(TOTAL_CHUNKS);
  });
});
