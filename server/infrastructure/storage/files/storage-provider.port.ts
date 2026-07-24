/** Provider-agnostic binary file payload. */
export interface StorageFileContent {
  readonly data: Uint8Array;
  readonly contentType: string;
  readonly size: number;
}

/** Request to upload a file to storage. */
export interface StorageUploadRequest {
  readonly path: string;
  readonly content: Uint8Array | Buffer;
  readonly contentType: string;
  readonly metadata?: Readonly<Record<string, string>>;
  readonly overwrite?: boolean;
}

/** Normalized file metadata returned by storage providers. */
export interface StorageFileMetadata {
  readonly path: string;
  readonly size: number;
  readonly contentType: string;
  readonly etag?: string;
  readonly lastModified?: string;
  readonly publicUrl?: string;
  readonly customMetadata?: Readonly<Record<string, string>>;
}

/** Normalized storage operation response. */
export interface StorageOperationResponse {
  readonly path: string;
  readonly publicUrl?: string;
  readonly metadata?: StorageFileMetadata;
}

/** Infrastructure storage port — implementations are provider-specific adapters. */
export interface IStorageProvider {
  uploadFile(request: StorageUploadRequest): Promise<StorageOperationResponse>;
  downloadFile(path: string): Promise<StorageFileContent>;
  deleteFile(path: string): Promise<void>;
  moveFile(sourcePath: string, destinationPath: string): Promise<StorageOperationResponse>;
  copyFile(sourcePath: string, destinationPath: string): Promise<StorageOperationResponse>;
  exists(path: string): Promise<boolean>;
  getMetadata(path: string): Promise<StorageFileMetadata | null>;
}
