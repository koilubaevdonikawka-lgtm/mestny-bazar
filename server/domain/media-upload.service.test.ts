import { describe, expect, it, vi } from "vitest";
import { MediaUploadService } from "@server/domain/media-upload.service";
import {
  MediaUploadProcessingError,
  MediaUploadValidationError,
} from "@server/domain/media-upload.errors";
import type { IStorageService, UploadResult } from "@server/ports/storage.service";
import type {
  IAiImageProvider,
  RemoveBackgroundResult,
} from "@server/ports/ai-image-provider.port";
import { MediaUploadContext } from "@shared/contracts/media-upload";

function fakeStorage(overrides: Partial<IStorageService> = {}): IStorageService {
  return {
    upload: vi.fn(async (path: string): Promise<UploadResult> => ({
      url: `https://x/${path}`,
      path,
    })),
    delete: vi.fn(async () => {}),
    getPublicUrl: vi.fn((path: string) => `https://x/${path}`),
    ...overrides,
  };
}

function fakeAiImageProvider(overrides: Partial<IAiImageProvider> = {}): IAiImageProvider {
  return {
    removeBackground: vi.fn(async (): Promise<RemoveBackgroundResult> => ({
      imageData: Buffer.from("processed"),
      mimeType: "image/png",
    })),
    ...overrides,
  };
}

function fakeFile(bytes = "original"): Blob {
  return {
    size: 1024,
    arrayBuffer: vi.fn(async () => new TextEncoder().encode(bytes).buffer),
  } as unknown as Blob;
}

describe("MediaUploadService.uploadImage", () => {
  it("rejects an unsupported MIME type before touching storage", async () => {
    const categoryStorage = fakeStorage();
    const mediaStorage = fakeStorage();
    const service = new MediaUploadService(categoryStorage, mediaStorage, fakeAiImageProvider());

    await expect(
      service.uploadImage({
        context: MediaUploadContext.CATEGORY,
        contentType: "application/pdf",
        size: 1024,
        data: fakeFile(),
      }),
    ).rejects.toBeInstanceOf(MediaUploadValidationError);
    expect(categoryStorage.upload).not.toHaveBeenCalled();
  });

  it("rejects a file exceeding the size limit before touching storage", async () => {
    const categoryStorage = fakeStorage();
    const mediaStorage = fakeStorage();
    const service = new MediaUploadService(categoryStorage, mediaStorage, fakeAiImageProvider());

    await expect(
      service.uploadImage({
        context: MediaUploadContext.BANNER,
        contentType: "image/png",
        size: 10_000_000,
        data: fakeFile(),
      }),
    ).rejects.toBeInstanceOf(MediaUploadValidationError);
    expect(mediaStorage.upload).not.toHaveBeenCalled();
  });

  it("uploads category images to the category bucket at a root (unprefixed) path", async () => {
    const categoryStorage = fakeStorage();
    const mediaStorage = fakeStorage();
    const service = new MediaUploadService(categoryStorage, mediaStorage, fakeAiImageProvider());

    await service.uploadImage({
      context: MediaUploadContext.CATEGORY,
      contentType: "image/png",
      size: 1024,
      data: fakeFile(),
    });

    expect(categoryStorage.upload).toHaveBeenCalledTimes(1);
    expect(mediaStorage.upload).not.toHaveBeenCalled();
    const [path] = (categoryStorage.upload as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(path).not.toContain("/");
    expect(path).toMatch(/\.png$/);
  });

  it("uploads banner/courier images to the media bucket, prefixed by context, unprocessed", async () => {
    const categoryStorage = fakeStorage();
    const mediaStorage = fakeStorage();
    const aiImageProvider = fakeAiImageProvider();
    const service = new MediaUploadService(categoryStorage, mediaStorage, aiImageProvider);

    await service.uploadImage({
      context: MediaUploadContext.COURIER,
      contentType: "image/webp",
      size: 1024,
      data: fakeFile(),
    });

    expect(mediaStorage.upload).toHaveBeenCalledTimes(1);
    expect(categoryStorage.upload).not.toHaveBeenCalled();
    expect(aiImageProvider.removeBackground).not.toHaveBeenCalled();
    const [path] = (mediaStorage.upload as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(path).toMatch(/^courier\/.+\.webp$/);
  });

  it("returns the URL produced by the storage adapter", async () => {
    const categoryStorage = fakeStorage();
    const mediaStorage = fakeStorage({
      upload: vi.fn(async () => ({ url: "https://cdn/example.png", path: "products/example.png" })),
    });
    const service = new MediaUploadService(categoryStorage, mediaStorage, fakeAiImageProvider());

    const result = await service.uploadImage({
      context: MediaUploadContext.PRODUCT,
      contentType: "image/png",
      size: 1024,
      data: fakeFile(),
    });

    expect(result).toEqual({ url: "https://cdn/example.png" });
  });

  it("uploads product photos to the media bucket unprocessed — AI background removal is temporarily disabled (Промпт №107)", async () => {
    const categoryStorage = fakeStorage();
    const mediaStorage = fakeStorage();
    const aiImageProvider = fakeAiImageProvider();
    const service = new MediaUploadService(categoryStorage, mediaStorage, aiImageProvider);
    const file = fakeFile("raw-upload");

    await service.uploadImage({
      context: MediaUploadContext.PRODUCT,
      contentType: "image/png",
      size: 1024,
      data: file,
    });

    expect(aiImageProvider.removeBackground).not.toHaveBeenCalled();
    const [, uploadedData, uploadedContentType] = (mediaStorage.upload as ReturnType<typeof vi.fn>)
      .mock.calls[0];
    expect(uploadedData).toBe(file);
    expect(uploadedContentType).toBe("image/png");
  });
});

// processProductPhoto() itself is unchanged and still fully functional — only
// uploadImage() no longer calls it (Промпт №107, see media-upload.service.ts's
// own comment). Called directly here (bypassing the private-method boundary)
// so these two tests keep proving the AI path still works if ever re-wired,
// without needing uploadImage() to still route through it.
describe("MediaUploadService.processProductPhoto (kept, not wired into uploadImage — Промпт №107)", () => {
  type UploadImageInput = Parameters<MediaUploadService["uploadImage"]>[0];

  function processProductPhoto(service: MediaUploadService, input: UploadImageInput) {
    return (
      service as unknown as {
        processProductPhoto: (
          input: UploadImageInput,
        ) => Promise<{ data: Buffer; contentType: string }>;
      }
    ).processProductPhoto(input);
  }

  it("runs product photos through the AI image provider and returns the processed result", async () => {
    const aiImageProvider = fakeAiImageProvider({
      removeBackground: vi.fn(async () => ({
        imageData: Buffer.from("white-background-version"),
        mimeType: "image/webp",
      })),
    });
    const service = new MediaUploadService(fakeStorage(), fakeStorage(), aiImageProvider);

    const result = await processProductPhoto(service, {
      context: MediaUploadContext.PRODUCT,
      contentType: "image/png",
      size: 1024,
      data: fakeFile("raw-upload"),
    });

    expect(aiImageProvider.removeBackground).toHaveBeenCalledTimes(1);
    expect(result.data.toString()).toBe("white-background-version");
    expect(result.contentType).toBe("image/webp");
  });

  it("throws MediaUploadProcessingError when background removal fails", async () => {
    const aiImageProvider = fakeAiImageProvider({
      removeBackground: vi.fn(async () => {
        throw new Error("provider not configured");
      }),
    });
    const service = new MediaUploadService(fakeStorage(), fakeStorage(), aiImageProvider);

    await expect(
      processProductPhoto(service, {
        context: MediaUploadContext.PRODUCT,
        contentType: "image/png",
        size: 1024,
        data: fakeFile(),
      }),
    ).rejects.toBeInstanceOf(MediaUploadProcessingError);
  });
});
