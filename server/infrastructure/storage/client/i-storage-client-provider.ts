import type {
  StorageClientCopyOptions,
  StorageClientMoveOptions,
  StorageClientUploadOptions,
  StorageHealthProbeResult,
  StorageObjectMetadata,
  StorageObjectPayload,
} from "@server/infrastructure/storage/shared";

/** Provides low-level access to the configured file storage backend. */
export interface IStorageClientProvider {
  uploadObject(options: StorageClientUploadOptions): Promise<StorageObjectMetadata>;
  downloadObject(key: string): Promise<StorageObjectPayload>;
  deleteObject(key: string): Promise<void>;
  moveObject(options: StorageClientMoveOptions): Promise<StorageObjectMetadata>;
  copyObject(options: StorageClientCopyOptions): Promise<StorageObjectMetadata>;
  objectExists(key: string): Promise<boolean>;
  getObjectMetadata(key: string): Promise<StorageObjectMetadata | null>;
  probeHealth(): Promise<StorageHealthProbeResult>;
}
