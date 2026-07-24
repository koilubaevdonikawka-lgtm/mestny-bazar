import type {
  IStorageProvider,
  StorageFileContent,
  StorageOperationResponse,
  StorageUploadRequest,
} from "@server/platform/integration/integration/contracts";
import type { IStorageProvider as InfrastructureStorageProvider } from "@server/infrastructure/storage/files";

/** Adapts infrastructure storage implementations to the platform storage contract. */
export class SupabaseStorageAdapter implements IStorageProvider {
  constructor(private readonly delegate: InfrastructureStorageProvider) {}

  uploadFile(request: StorageUploadRequest): Promise<StorageOperationResponse> {
    return this.delegate.uploadFile(request);
  }

  downloadFile(path: string): Promise<StorageFileContent> {
    return this.delegate.downloadFile(path);
  }

  deleteFile(path: string): Promise<void> {
    return this.delegate.deleteFile(path);
  }

  moveFile(sourcePath: string, destinationPath: string): Promise<StorageOperationResponse> {
    return this.delegate.moveFile(sourcePath, destinationPath);
  }

  copyFile(sourcePath: string, destinationPath: string): Promise<StorageOperationResponse> {
    return this.delegate.copyFile(sourcePath, destinationPath);
  }

  exists(path: string): Promise<boolean> {
    return this.delegate.exists(path);
  }

  getMetadata(path: string) {
    return this.delegate.getMetadata(path);
  }
}
