import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/api/media-upload";
import { compressImageForUpload } from "@/lib/image-compression";
import {
  MEDIA_UPLOAD_ALLOWED_MIME_TYPES,
  MEDIA_UPLOAD_MAX_BYTES,
  type MediaUploadContext,
} from "@shared/contracts/media-upload";

interface MultiImageUploadFieldProps {
  values: string[];
  onChange: (urls: string[]) => void;
  context: MediaUploadContext;
  label?: string;
  /** Small muted caption under the label — e.g. product's "prepare the background yourself" note (Промпт №107). Omitted entirely for contexts that don't need one, so category/banner/courier stay unchanged. */
  hint?: string;
  disabled?: boolean;
  /** Задача №206 — matches seller-product.schema.ts's imageUrls cap (max 10), the only real limit today; kept as an overridable prop rather than hardcoded so this stays reusable for a future context with a different cap. */
  maxImages?: number;
}

/**
 * Многофотографный вариант ImageUploadField (Промпт №1, новая серия) —
 * переиспользует тот же uploadImage()/MediaUploadService (без второго
 * механизма загрузки), просто накапливает несколько ссылок вместо одной.
 * ImageUploadField сам не меняется — категории/баннеры/курьеры не затронуты.
 */
export function MultiImageUploadField({
  values,
  onChange,
  context,
  label = "Фотографии товара",
  hint,
  disabled,
  maxImages = 10,
}: MultiImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const atLimit = values.length >= maxImages;
  // Задача №239 — separate from mutation.isPending: compression (Canvas,
  // client-side) runs BEFORE the upload request even starts.
  const [isCompressing, setIsCompressing] = useState(false);

  const mutation = useMutation({
    mutationFn: (file: File) => uploadImage(file, context),
    onSuccess: (url) => onChange([...values, url]),
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Не удалось загрузить изображение"),
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (atLimit) {
      toast.error(`Максимум ${maxImages} фотографий`);
      return;
    }
    if (!(MEDIA_UPLOAD_ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
      toast.error("Поддерживаются только изображения PNG, JPEG, WEBP или AVIF");
      return;
    }

    // Задача №239 — resizes/re-encodes down toward the server limit before
    // it ever leaves the browser; a no-op for a file already comfortably
    // under it (see compressImageForUpload's own skip threshold).
    let toUpload: File;
    setIsCompressing(true);
    try {
      toUpload = await compressImageForUpload(file);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Не удалось сжать фото до нужного размера, попробуйте другое изображение",
      );
      return;
    } finally {
      setIsCompressing(false);
    }

    // Belt-and-suspenders: compressImageForUpload targets a margin under
    // MEDIA_UPLOAD_MAX_BYTES and throws on failure, so this should never
    // trip — but a doomed request is never sent regardless.
    if (toUpload.size > MEDIA_UPLOAD_MAX_BYTES) {
      toast.error("Не удалось сжать фото до нужного размера, попробуйте другое изображение");
      return;
    }
    mutation.mutate(toUpload);
  };

  const removeAt = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium leading-none">{label}</span>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <div className="flex flex-wrap items-center gap-3">
        {values.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-secondary/40"
          >
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(index)}
              disabled={disabled || mutation.isPending}
              className="absolute right-0.5 top-0.5 rounded-full bg-background/90 p-0.5 text-muted-foreground hover:text-destructive"
              aria-label="Удалить изображение"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {!atLimit && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || isCompressing || mutation.isPending}
            onClick={() => inputRef.current?.click()}
          >
            {isCompressing || mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
            {isCompressing ? "Сжимаем фото..." : "Добавить фото"}
          </Button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={MEDIA_UPLOAD_ALLOWED_MIME_TYPES.join(",")}
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled || atLimit}
        />
      </div>
      {atLimit && <p className="text-xs text-muted-foreground">Максимум {maxImages} фотографий</p>}
    </div>
  );
}
