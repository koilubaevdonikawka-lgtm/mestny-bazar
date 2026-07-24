/** Parsed image metadata extracted without third-party libraries. */
export interface ImageMetadata {
  readonly width?: number;
  readonly height?: number;
  readonly format: "jpeg" | "png" | "webp" | "gif" | "unknown";
  readonly size: number;
  readonly contentType: string;
}

/** Extracts image metadata using lightweight binary header inspection. */
export class ImageMetadataReader {
  read(content: Uint8Array, contentType: string): ImageMetadata {
    const format = detectFormat(content, contentType);
    const dimensions = readDimensions(content, format);

    return Object.freeze({
      width: dimensions?.width,
      height: dimensions?.height,
      format,
      size: content.byteLength,
      contentType,
    });
  }
}

function detectFormat(content: Uint8Array, contentType: string): ImageMetadata["format"] {
  if (content.length >= 3 && content[0] === 0xff && content[1] === 0xd8 && content[2] === 0xff) {
    return "jpeg";
  }
  if (
    content.length >= 8 &&
    content[0] === 0x89 &&
    content[1] === 0x50 &&
    content[2] === 0x4e &&
    content[3] === 0x47
  ) {
    return "png";
  }
  if (content.length >= 4 && content[0] === 0x47 && content[1] === 0x49 && content[2] === 0x46) {
    return "gif";
  }
  if (
    content.length >= 12 &&
    content[0] === 0x52 &&
    content[1] === 0x49 &&
    content[2] === 0x46 &&
    content[3] === 0x46 &&
    content[8] === 0x57 &&
    content[9] === 0x45 &&
    content[10] === 0x42 &&
    content[11] === 0x50
  ) {
    return "webp";
  }

  if (contentType.includes("jpeg")) return "jpeg";
  if (contentType.includes("png")) return "png";
  if (contentType.includes("gif")) return "gif";
  if (contentType.includes("webp")) return "webp";
  return "unknown";
}

function readDimensions(
  content: Uint8Array,
  format: ImageMetadata["format"],
): { width: number; height: number } | null {
  if (format === "png" && content.length >= 24) {
    const view = new DataView(content.buffer, content.byteOffset, content.byteLength);
    return {
      width: view.getUint32(16, false),
      height: view.getUint32(20, false),
    };
  }

  if (format === "gif" && content.length >= 10) {
    const view = new DataView(content.buffer, content.byteOffset, content.byteLength);
    return {
      width: view.getUint16(6, true),
      height: view.getUint16(8, true),
    };
  }

  if (format === "jpeg") {
    return readJpegDimensions(content);
  }

  return null;
}

function readJpegDimensions(content: Uint8Array): { width: number; height: number } | null {
  let offset = 2;
  while (offset < content.length) {
    if (content[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = content[offset + 1];
    if (marker === 0xc0 || marker === 0xc2) {
      const view = new DataView(content.buffer, content.byteOffset, content.byteLength);
      return {
        height: view.getUint16(offset + 5, false),
        width: view.getUint16(offset + 7, false),
      };
    }

    const segmentLength = (content[offset + 2] << 8) + content[offset + 3];
    offset += 2 + segmentLength;
  }

  return null;
}
