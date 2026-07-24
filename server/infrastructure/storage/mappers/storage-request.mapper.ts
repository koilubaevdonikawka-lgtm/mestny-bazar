import type { StorageUploadRequest } from "@server/infrastructure/storage/files";
import type { StorageClientUploadOptions } from "@server/infrastructure/storage/shared";

/** Maps infrastructure storage requests to client upload options. */
export class StorageRequestMapper {
  toUploadOptions(request: StorageUploadRequest): StorageClientUploadOptions {
    return Object.freeze({
      key: normalizePath(request.path),
      content: request.content,
      contentType: request.contentType,
      metadata: request.metadata,
      overwrite: request.overwrite,
    });
  }

  toObjectKey(path: string): string {
    return normalizePath(path);
  }
}

function normalizePath(path: string): string {
  return path.replace(/^\/+/, "");
}
