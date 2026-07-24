import type {
  IStorageProvider,
  StorageFileContent,
  StorageFileMetadata,
  StorageOperationResponse,
  StorageUploadRequest,
} from "@server/infrastructure/storage/files/storage-provider.port";

/** No-op storage provider for local development and tests. */
export class NoopStorageProvider implements IStorageProvider {
  private readonly files = new Map<string, StorageFileContent>();

  async uploadFile(request: StorageUploadRequest): Promise<StorageOperationResponse> {
    const data = toUint8Array(request.content);
    const content: StorageFileContent = Object.freeze({
      data,
      contentType: request.contentType,
      size: data.byteLength,
    });
    this.files.set(normalizePath(request.path), content);

    return Object.freeze({
      path: request.path,
      metadata: Object.freeze({
        path: request.path,
        size: content.size,
        contentType: content.contentType,
      }),
    });
  }

  async downloadFile(path: string): Promise<StorageFileContent> {
    const file = this.files.get(normalizePath(path));
    if (!file) {
      throw new Error(`NoopStorageProvider: file not found at ${path}`);
    }
    return file;
  }

  async deleteFile(path: string): Promise<void> {
    this.files.delete(normalizePath(path));
  }

  async moveFile(sourcePath: string, destinationPath: string): Promise<StorageOperationResponse> {
    const file = await this.downloadFile(sourcePath);
    await this.uploadFile({
      path: destinationPath,
      content: file.data,
      contentType: file.contentType,
    });
    await this.deleteFile(sourcePath);
    return Object.freeze({ path: destinationPath });
  }

  async copyFile(sourcePath: string, destinationPath: string): Promise<StorageOperationResponse> {
    const file = await this.downloadFile(sourcePath);
    return this.uploadFile({
      path: destinationPath,
      content: file.data,
      contentType: file.contentType,
    });
  }

  async exists(path: string): Promise<boolean> {
    return this.files.has(normalizePath(path));
  }

  async getMetadata(path: string): Promise<StorageFileMetadata | null> {
    const file = this.files.get(normalizePath(path));
    if (!file) {
      return null;
    }
    return Object.freeze({
      path,
      size: file.size,
      contentType: file.contentType,
    });
  }
}

function normalizePath(path: string): string {
  return path.replace(/^\/+/, "");
}

function toUint8Array(content: Uint8Array | Buffer): Uint8Array {
  return content instanceof Uint8Array ? content : new Uint8Array(content);
}
