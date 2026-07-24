/** Low-level object metadata returned by storage clients. */
export interface StorageObjectMetadata {
  readonly key: string;
  readonly size: number;
  readonly contentType: string;
  readonly etag?: string;
  readonly lastModified?: string;
  readonly customMetadata?: Readonly<Record<string, string>>;
}

/** Low-level object payload returned by storage clients. */
export interface StorageObjectPayload {
  readonly key: string;
  readonly data: Uint8Array;
  readonly contentType: string;
  readonly size: number;
  readonly etag?: string;
  readonly lastModified?: string;
}

export interface StorageClientUploadOptions {
  readonly key: string;
  readonly content: Uint8Array | Buffer;
  readonly contentType: string;
  readonly metadata?: Readonly<Record<string, string>>;
  readonly overwrite?: boolean;
}

export interface StorageClientCopyOptions {
  readonly sourceKey: string;
  readonly destinationKey: string;
}

export interface StorageClientMoveOptions {
  readonly sourceKey: string;
  readonly destinationKey: string;
}

export interface StorageHealthProbeResult {
  readonly reachable: boolean;
  readonly message: string;
}
