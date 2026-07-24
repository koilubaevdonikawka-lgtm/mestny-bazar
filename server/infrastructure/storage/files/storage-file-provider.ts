import type {
  IStorageProvider,
  StorageFileContent,
  StorageFileMetadata,
  StorageOperationResponse,
  StorageUploadRequest,
} from "@server/infrastructure/storage/files";
import type { IStorageClientProvider } from "@server/infrastructure/storage/client";
import type { StorageConfiguration } from "@server/infrastructure/storage/configuration";
import { StorageRequestMapper } from "@server/infrastructure/storage/mappers/storage-request.mapper";
import { StorageResponseMapper } from "@server/infrastructure/storage/mappers/storage-response.mapper";

/** Storage port implementation backed by the configured storage client. */
export class StorageFileProvider implements IStorageProvider {
  private readonly requestMapper = new StorageRequestMapper();
  private readonly responseMapper: StorageResponseMapper;

  constructor(
    private readonly client: IStorageClientProvider,
    configuration: StorageConfiguration,
  ) {
    this.responseMapper = new StorageResponseMapper(configuration);
    Object.freeze(this);
  }

  async uploadFile(request: StorageUploadRequest): Promise<StorageOperationResponse> {
    const metadata = await this.client.uploadObject(this.requestMapper.toUploadOptions(request));
    return this.responseMapper.toOperationResponse(metadata);
  }

  async downloadFile(path: string): Promise<StorageFileContent> {
    const payload = await this.client.downloadObject(this.requestMapper.toObjectKey(path));
    return this.responseMapper.toFileContent(payload);
  }

  async deleteFile(path: string): Promise<void> {
    await this.client.deleteObject(this.requestMapper.toObjectKey(path));
  }

  async moveFile(
    sourcePath: string,
    destinationPath: string,
  ): Promise<StorageOperationResponse> {
    const metadata = await this.client.moveObject({
      sourceKey: this.requestMapper.toObjectKey(sourcePath),
      destinationKey: this.requestMapper.toObjectKey(destinationPath),
    });
    return this.responseMapper.toOperationResponse(metadata);
  }

  async copyFile(sourcePath: string, destinationPath: string): Promise<StorageOperationResponse> {
    const metadata = await this.client.copyObject({
      sourceKey: this.requestMapper.toObjectKey(sourcePath),
      destinationKey: this.requestMapper.toObjectKey(destinationPath),
    });
    return this.responseMapper.toOperationResponse(metadata);
  }

  async exists(path: string): Promise<boolean> {
    return this.client.objectExists(this.requestMapper.toObjectKey(path));
  }

  async getMetadata(path: string): Promise<StorageFileMetadata | null> {
    const metadata = await this.client.getObjectMetadata(this.requestMapper.toObjectKey(path));
    if (!metadata) {
      return null;
    }
    return this.responseMapper.toFileMetadata(metadata);
  }
}
