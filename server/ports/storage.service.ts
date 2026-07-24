export interface UploadResult {
  url: string;
  path: string;
}

export interface IStorageService {
  upload(path: string, file: Blob | Buffer, contentType: string): Promise<UploadResult>;
  delete(path: string): Promise<void>;
  getPublicUrl(path: string): string;
}
