import { createHash } from "node:crypto";

import type {
  IMediaMetadataService,
  MediaAssetInput,
  ResolvedMediaAsset,
} from "@server/ports/marketplace-ai/media-analysis.port";

const MAX_FETCH_BYTES = 10 * 1024 * 1024;
// This runs synchronously inside the checkout request (AIMediaWorker is
// subscribed to "order.created", which CheckoutService awaits) — an
// unreachable or deliberately slow image host must not be able to hang the
// customer's checkout response indefinitely.
const FETCH_TIMEOUT_MS = 5000;

/** Resolves media metadata from provided fields or remote URLs (no vision API). */
export class MediaMetadataService implements IMediaMetadataService {
  async resolveAssets(inputs: MediaAssetInput[]): Promise<ResolvedMediaAsset[]> {
    const resolved: ResolvedMediaAsset[] = [];

    for (const input of inputs) {
      resolved.push(await this.resolveAsset(input));
    }

    return resolved;
  }

  private async resolveAsset(input: MediaAssetInput): Promise<ResolvedMediaAsset> {
    const hasCompleteMetadata =
      input.width !== undefined &&
      input.height !== undefined &&
      input.fileSizeBytes !== undefined &&
      input.hash !== undefined;

    if (hasCompleteMetadata) {
      return this.toResolvedAsset(input, {
        hash: input.hash!,
        width: input.width!,
        height: input.height!,
        fileSizeBytes: input.fileSizeBytes!,
      });
    }

    try {
      const fetched = await this.fetchImageMetadata(input.url);
      return this.toResolvedAsset(input, fetched);
    } catch {
      return {
        id: input.id,
        url: input.url,
        hash: input.hash ?? createHash("sha256").update(input.url).digest("hex"),
        width: input.width ?? null,
        height: input.height ?? null,
        fileSizeBytes: input.fileSizeBytes ?? null,
        aspectRatio: this.computeAspectRatio(input.width ?? null, input.height ?? null),
      };
    }
  }

  private toResolvedAsset(
    input: MediaAssetInput,
    fetched: {
      hash: string;
      width: number | null;
      height: number | null;
      fileSizeBytes: number | null;
    },
  ): ResolvedMediaAsset {
    return {
      id: input.id,
      url: input.url,
      hash: fetched.hash,
      width: fetched.width,
      height: fetched.height,
      fileSizeBytes: fetched.fileSizeBytes,
      aspectRatio: this.computeAspectRatio(fetched.width, fetched.height),
    };
  }

  private computeAspectRatio(width: number | null, height: number | null): number | null {
    if (!width || !height || height === 0) {
      return null;
    }
    return Number((width / height).toFixed(4));
  }

  private async fetchImageMetadata(url: string): Promise<{
    hash: string;
    width: number | null;
    height: number | null;
    fileSizeBytes: number | null;
  }> {
    const response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch media: ${response.status}`);
    }

    // Reject on the declared size before reading a single byte of the body —
    // but a server can omit or lie about Content-Length, so this alone isn't
    // a real guarantee; readBodyWithLimit enforces the cap during the read
    // itself regardless of what this header claims.
    const contentLength = response.headers.get("content-length");
    const declaredSize = contentLength ? Number(contentLength) : null;
    if (declaredSize !== null && Number.isFinite(declaredSize) && declaredSize > MAX_FETCH_BYTES) {
      throw new Error("Media file exceeds fetch limit");
    }

    const buffer = await this.readBodyWithLimit(response, MAX_FETCH_BYTES);

    const dimensions = parseImageDimensions(buffer);
    return {
      hash: createHash("sha256").update(buffer).digest("hex"),
      width: dimensions?.width ?? null,
      height: dimensions?.height ?? null,
      fileSizeBytes: declaredSize ?? buffer.byteLength,
    };
  }

  /**
   * Streams the response body, counting bytes as they arrive and bailing out
   * the moment the running total exceeds maxBytes — the previous
   * implementation called response.arrayBuffer(), which reads the ENTIRE
   * body into memory before any size check ran. A slow-but-huge response
   * (or one lying about Content-Length) could exhaust the Worker isolate's
   * memory before the old check ever fired.
   */
  private async readBodyWithLimit(response: Response, maxBytes: number): Promise<Buffer> {
    const body = response.body;
    if (!body) {
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.byteLength > maxBytes) {
        throw new Error("Media file exceeds fetch limit");
      }
      return buffer;
    }

    const reader = body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel("Media file exceeds fetch limit").catch(() => {});
        throw new Error("Media file exceeds fetch limit");
      }
      chunks.push(value);
    }

    return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
  }
}

// Compared byte-for-byte rather than via buffer.toString("ascii", ...): Node's
// "ascii" decoding strips the high bit of every byte, so 0x89 (this signature's
// first byte, present in every real PNG) would decode to 0x09 and never match
// the literal "\x89..." string here — that string comparison could never be
// true for an actual PNG file, silently sending every PNG through this
// function as if it were unrecognized.
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function parseImageDimensions(buffer: Buffer): { width: number; height: number } | null {
  if (buffer.length >= 24 && buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }

  if (buffer.length >= 10 && buffer.toString("ascii", 0, 6) === "GIF87a") {
    return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
  }

  if (buffer.length >= 10 && buffer.toString("ascii", 0, 6) === "GIF89a") {
    return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
  }

  if (
    buffer.length >= 30 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return parseWebpDimensions(buffer);
  }

  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    return parseJpegDimensions(buffer);
  }

  return null;
}

function parseJpegDimensions(buffer: Buffer): { width: number; height: number } | null {
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      break;
    }

    const marker = buffer[offset + 1];
    if (marker === undefined) {
      break;
    }

    if (marker === 0xc0 || marker === 0xc2) {
      const height = buffer.readUInt16BE(offset + 5);
      const width = buffer.readUInt16BE(offset + 7);
      return { width, height };
    }

    const segmentLength = buffer.readUInt16BE(offset + 2);
    offset += 2 + segmentLength;
  }

  return null;
}

function parseWebpDimensions(buffer: Buffer): { width: number; height: number } | null {
  if (buffer.toString("ascii", 12, 16) === "VP8 ") {
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    };
  }

  if (buffer.toString("ascii", 12, 16) === "VP8L") {
    const bits = buffer.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }

  if (buffer.toString("ascii", 12, 16) === "VP8X") {
    const width = 1 + buffer.readUIntLE(24, 3);
    const height = 1 + buffer.readUIntLE(27, 3);
    return { width, height };
  }

  return null;
}
