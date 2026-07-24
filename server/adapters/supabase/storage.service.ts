import type { UploadResult } from "@server/ports/storage.service";
import type { IStorageService } from "@server/ports/storage.service";

/** Supabase Storage implementation — wired in Stage 8. */
export class SupabaseStorageAdapter implements IStorageService {
  async upload(_path: string, _file: Blob | Buffer, _contentType: string): Promise<UploadResult> {
    throw new Error("SupabaseStorageAdapter.upload not implemented (Stage 8)");
  }

  async delete(_path: string): Promise<void> {
    throw new Error("SupabaseStorageAdapter.delete not implemented (Stage 8)");
  }

  getPublicUrl(_path: string): string {
    throw new Error("SupabaseStorageAdapter.getPublicUrl not implemented (Stage 8)");
  }
}
