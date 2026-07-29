import { createHash } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MediaMetadataService } from "@server/domain/marketplace-ai/media/media-metadata.service";

function makePng(width: number, height: number): Buffer {
  const buf = Buffer.alloc(24);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buf, 0);
  buf.writeUInt32BE(13, 8);
  buf.write("IHDR", 12, "ascii");
  buf.writeUInt32BE(width, 16);
  buf.writeUInt32BE(height, 20);
  return buf;
}

function makeGif(width: number, height: number, version: "87a" | "89a" = "89a"): Buffer {
  const buf = Buffer.alloc(10);
  buf.write(`GIF${version}`, 0, "ascii");
  buf.writeUInt16LE(width, 6);
  buf.writeUInt16LE(height, 8);
  return buf;
}

function makeJpeg(width: number, height: number): Buffer {
  const buf = Buffer.alloc(11);
  buf[0] = 0xff;
  buf[1] = 0xd8;
  buf[2] = 0xff;
  buf[3] = 0xc0;
  buf.writeUInt16BE(0x0011, 4);
  buf[6] = 0x08;
  buf.writeUInt16BE(height, 7);
  buf.writeUInt16BE(width, 9);
  return buf;
}

function makeWebpVp8(width: number, height: number): Buffer {
  const buf = Buffer.alloc(30);
  buf.write("RIFF", 0, "ascii");
  buf.writeUInt32LE(22, 4);
  buf.write("WEBP", 8, "ascii");
  buf.write("VP8 ", 12, "ascii");
  buf.writeUInt32LE(10, 16);
  buf[23] = 0x9d;
  buf[24] = 0x01;
  buf[25] = 0x2a;
  buf.writeUInt16LE(width & 0x3fff, 26);
  buf.writeUInt16LE(height & 0x3fff, 28);
  return buf;
}

function makeWebpVp8l(width: number, height: number): Buffer {
  const buf = Buffer.alloc(30);
  buf.write("RIFF", 0, "ascii");
  buf.writeUInt32LE(22, 4);
  buf.write("WEBP", 8, "ascii");
  buf.write("VP8L", 12, "ascii");
  buf.writeUInt32LE(10, 16);
  buf[20] = 0x2f;
  const bits = (((height - 1) & 0x3fff) << 14) | ((width - 1) & 0x3fff);
  buf.writeUInt32LE(bits >>> 0, 21);
  return buf;
}

function makeWebpVp8x(width: number, height: number): Buffer {
  const buf = Buffer.alloc(30);
  buf.write("RIFF", 0, "ascii");
  buf.writeUInt32LE(22, 4);
  buf.write("WEBP", 8, "ascii");
  buf.write("VP8X", 12, "ascii");
  buf.writeUInt32LE(10, 16);
  buf.writeUIntLE(width - 1, 24, 3);
  buf.writeUIntLE(height - 1, 27, 3);
  return buf;
}

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

  it("skips fetching entirely when the input already has complete metadata", async () => {
    const fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    const service = new MediaMetadataService();
    const result = await service.resolveAssets([
      {
        id: "product-1",
        url: "https://example.com/photo.jpg",
        width: 800,
        height: 600,
        fileSizeBytes: 12345,
        hash: "precomputed-hash",
      },
    ]);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result).toEqual([
      {
        id: "product-1",
        url: "https://example.com/photo.jpg",
        hash: "precomputed-hash",
        width: 800,
        height: 600,
        fileSizeBytes: 12345,
        aspectRatio: Number((800 / 600).toFixed(4)),
      },
    ]);
  });

  it("returns a null aspect ratio when height is zero, without dividing by zero", async () => {
    const service = new MediaMetadataService();
    const result = await service.resolveAssets([
      {
        id: "product-1",
        url: "https://example.com/photo.jpg",
        width: 800,
        height: 0,
        fileSizeBytes: 100,
        hash: "h",
      },
    ]);

    expect(result[0]?.aspectRatio).toBeNull();
  });

  it("hashes the actual fetched bytes and uses buffer length when Content-Length is absent", async () => {
    const buffer = makePng(10, 10);
    global.fetch = vi.fn(
      async () => new Response(new Uint8Array(buffer), { status: 200 }),
    ) as unknown as typeof fetch;

    const service = new MediaMetadataService();
    const result = await service.resolveAssets([
      { id: "product-1", url: "https://example.com/photo.png" },
    ]);

    expect(result[0]?.hash).toBe(createHash("sha256").update(buffer).digest("hex"));
    expect(result[0]?.fileSizeBytes).toBe(buffer.byteLength);
  });

  it("uses the declared Content-Length for fileSizeBytes when present", async () => {
    const buffer = makePng(10, 10);
    global.fetch = vi.fn(
      async () =>
        new Response(new Uint8Array(buffer), {
          status: 200,
          headers: { "content-length": String(buffer.byteLength) },
        }),
    ) as unknown as typeof fetch;

    const service = new MediaMetadataService();
    const result = await service.resolveAssets([
      { id: "product-1", url: "https://example.com/photo.png" },
    ]);

    expect(result[0]?.fileSizeBytes).toBe(buffer.byteLength);
  });

  it("returns null width/height for an unrecognized image format", async () => {
    const buffer = Buffer.from("not an image, just plain text bytes");
    global.fetch = vi.fn(
      async () => new Response(new Uint8Array(buffer), { status: 200 }),
    ) as unknown as typeof fetch;

    const service = new MediaMetadataService();
    const result = await service.resolveAssets([
      { id: "product-1", url: "https://example.com/mystery.bin" },
    ]);

    expect(result[0]?.width).toBeNull();
    expect(result[0]?.height).toBeNull();
    expect(result[0]?.aspectRatio).toBeNull();
  });

  describe("image dimension parsing", () => {
    async function resolveFromBuffer(buffer: Buffer) {
      global.fetch = vi.fn(
        async () => new Response(new Uint8Array(buffer), { status: 200 }),
      ) as unknown as typeof fetch;
      const service = new MediaMetadataService();
      const [result] = await service.resolveAssets([
        { id: "product-1", url: "https://example.com/photo" },
      ]);
      return result!;
    }

    it("parses PNG IHDR width/height", async () => {
      const result = await resolveFromBuffer(makePng(400, 300));
      expect(result.width).toBe(400);
      expect(result.height).toBe(300);
    });

    it("parses GIF87a logical screen descriptor dimensions", async () => {
      const result = await resolveFromBuffer(makeGif(120, 80, "87a"));
      expect(result.width).toBe(120);
      expect(result.height).toBe(80);
    });

    it("parses GIF89a logical screen descriptor dimensions", async () => {
      const result = await resolveFromBuffer(makeGif(640, 480, "89a"));
      expect(result.width).toBe(640);
      expect(result.height).toBe(480);
    });

    it("parses JPEG SOF0 width/height", async () => {
      const result = await resolveFromBuffer(makeJpeg(1024, 768));
      expect(result.width).toBe(1024);
      expect(result.height).toBe(768);
    });

    it("parses lossy WebP (VP8) width/height", async () => {
      const result = await resolveFromBuffer(makeWebpVp8(500, 400));
      expect(result.width).toBe(500);
      expect(result.height).toBe(400);
    });

    it("parses lossless WebP (VP8L) width/height from the packed bitfield", async () => {
      const result = await resolveFromBuffer(makeWebpVp8l(100, 200));
      expect(result.width).toBe(100);
      expect(result.height).toBe(200);
    });

    it("parses extended WebP (VP8X) width/height", async () => {
      const result = await resolveFromBuffer(makeWebpVp8x(300, 150));
      expect(result.width).toBe(300);
      expect(result.height).toBe(150);
    });

    it("computes and rounds aspect ratio to 4 decimals from the parsed dimensions", async () => {
      const result = await resolveFromBuffer(makeJpeg(1000, 300));
      expect(result.aspectRatio).toBe(Number((1000 / 300).toFixed(4)));
    });
  });
});
