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
});
