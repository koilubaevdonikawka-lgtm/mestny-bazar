import type { UploadResult } from "@server/ports/storage.service";
import type { IStorageService } from "@server/ports/storage.service";
import { supabaseAdmin } from "@server/adapters/supabase/client";

/**
 * Supabase Storage implementation. Constructor-injected bucket name so one
 * class serves every bucket (category-images, marketplace-media) — the port
 * itself has no notion of "which bucket", only "upload this path".
 *
 * On Cloudflare Workers there is no Node Buffer — callers always pass a Blob
 * (the File object straight from FormData), never convert to Buffer.
 */
export class SupabaseStorageAdapter implements IStorageService {
  constructor(private readonly bucket: string) {}

  async upload(path: string, file: Blob | Buffer, contentType: string): Promise<UploadResult> {
    const { error } = await supabaseAdmin.storage
      .from(this.bucket)
      .upload(path, file, { contentType, upsert: false });
    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
    return { url: this.getPublicUrl(path), path };
  }

  async delete(path: string): Promise<void> {
    const { error } = await supabaseAdmin.storage.from(this.bucket).remove([path]);
    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  getPublicUrl(path: string): string {
    return supabaseAdmin.storage.from(this.bucket).getPublicUrl(path).data.publicUrl;
  }
}
