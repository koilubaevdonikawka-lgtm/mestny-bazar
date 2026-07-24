import type {
  StorageFileContent,
  StorageFileMetadata,
  StorageOperationResponse,
} from "@server/infrastructure/storage/files";
import type { StorageConfiguration } from "@server/infrastructure/storage/configuration";
import type { StorageObjectMetadata, StorageObjectPayload } from "@server/infrastructure/storage/shared";

/** Maps storage client payloads to infrastructure storage responses. */
export class StorageResponseMapper {
  constructor(private readonly configuration: StorageConfiguration) {}

  toOperationResponse(metadata: StorageObjectMetadata): StorageOperationResponse {
    return Object.freeze({
      path: metadata.key,
      publicUrl: this.configuration.objectPublicUrl(metadata.key),
      metadata: this.toFileMetadata(metadata),
    });
  }

  toFileContent(payload: StorageObjectPayload): StorageFileContent {
    return Object.freeze({
      data: payload.data,
      contentType: payload.contentType,
      size: payload.size,
    });
  }

  toFileMetadata(metadata: StorageObjectMetadata): StorageFileMetadata {
    return Object.freeze({
      path: metadata.key,
      size: metadata.size,
      contentType: metadata.contentType,
      etag: metadata.etag,
      lastModified: metadata.lastModified,
      publicUrl: this.configuration.objectPublicUrl(metadata.key),
      customMetadata: metadata.customMetadata,
    });
  }
}
