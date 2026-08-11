/** Unified image upload (Промпт №068) — single mechanism behind every
 * "Загрузить изображение" button in the admin/seller panels. */
export const MEDIA_UPLOAD_MAX_BYTES = 5_242_880;

export const MEDIA_UPLOAD_ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
] as const;
export type MediaUploadMimeType = (typeof MEDIA_UPLOAD_ALLOWED_MIME_TYPES)[number];

export const MediaUploadContext = {
  CATEGORY: "category",
  PRODUCT: "product",
  BANNER: "banner",
  COURIER: "courier",
} as const;
export type MediaUploadContext = (typeof MediaUploadContext)[keyof typeof MediaUploadContext];

export interface UploadImageResponse {
  url: string;
}
