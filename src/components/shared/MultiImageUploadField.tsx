import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/api/media-upload";
import { compressImageForUpload, normalizeExifOrientation } from "@/lib/image-compression";
import { convertHeicToJpeg, isHeicFile } from "@/lib/heic-conversion";
import { cn } from "@/lib/utils";
import {
  MediaUploadContext,
  MEDIA_UPLOAD_ALLOWED_MIME_TYPES,
  MEDIA_UPLOAD_MAX_BYTES,
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
  // Задача №239 — separate from the upload requests: compression (Canvas,
  // client-side) runs BEFORE the upload request even starts. Задача №261 —
  // "converting" covers the HEIC→JPEG step (heic2any), which runs first
  // and can take a few seconds on its own (WASM decode), hence the
  // distinct label rather than lumping it into "Сжимаем фото...".
  const [stage, setStage] = useState<"idle" | "converting" | "compressing">("idle");
  // Задача №284 — in-flight batch (null when idle); see handleFileChange.
  const [progress, setProgress] = useState<{ total: number; finished: number } | null>(null);
  const isUploading = progress !== null;
  const isBusy = stage !== "idle" || isUploading;
  // Задача №250 — PRODUCT-only AI-background-processing toggle. Задача
  // №275 — default flipped to OFF ("без обработки ИИ" is now the primary
  // path; AI processing is opt-in via explicit click). Plain component
  // state, not persisted anywhere — remembers the choice for as long as
  // this form stays mounted/open (so uploading several photos in a row
  // doesn't need re-toggling each time), resets to OFF on next open.
  const [aiProcessingEnabled, setAiProcessingEnabled] = useState(false);
  const isProduct = context === MediaUploadContext.PRODUCT;

  // Задача №284 — one gallery pick can now carry several files. Files are
  // prepared (HEIC→JPEG / EXIF / compression — CPU- and memory-heavy, so
  // strictly one at a time) in selection order, but each upload starts the
  // moment its file is ready and they overlap on the network. `progress`
  // replaces the old single-request mutation.isPending so the spinner
  // covers the whole batch.
  // Latest `values`, read once the whole batch settles: the closure captured
  // when the picker fired can be stale by then.
  const valuesRef = useRef(values);
  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  /** Validates and prepares one file; throws an Error carrying the user-facing message. */
  const prepareForUpload = async (file: File): Promise<File> => {
    const isHeic = isHeicFile(file);
    if (!isHeic && !(MEDIA_UPLOAD_ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
      throw new Error("Поддерживаются только изображения PNG, JPEG, WEBP, AVIF, HEIC или HEIF");
    }

    // Задача №239 — caps the photo at 1200px / ~80% quality (WebP, JPEG
    // fallback) before it ever leaves the browser; an already web-sized
    // file is sent as-is (see compressImageForUpload). Задача
    // №261 — HEIC/HEIF first converts to JPEG (heic2any) so the rest of
    // the pipeline (EXIF fallback, compression, upload) only ever sees a
    // normal JPEG.
    let toUpload: File;
    try {
      let jpegSource = file;
      if (isHeic) {
        setStage("converting");
        jpegSource = await convertHeicToJpeg(file);
      }
      // PRODUCT + "Без обработки ИИ": Gemini never sees this photo, so it
      // gets the mechanical EXIF-orientation fallback instead (bakes any
      // camera-rotation tag into upright pixels) before compression runs —
      // see normalizeExifOrientation's own doc comment for why this can't
      // just be done server-side like the AI branch's prompt fix.
      const source =
        isProduct && !aiProcessingEnabled ? await normalizeExifOrientation(jpegSource) : jpegSource;
      setStage("compressing");
      toUpload = await compressImageForUpload(source);
    } catch (err) {
      throw new Error(
        err instanceof Error
          ? err.message
          : "Не удалось сжать фото до нужного размера, попробуйте другое изображение",
      );
    } finally {
      setStage("idle");
    }

    // Belt-and-suspenders: compressImageForUpload targets a margin under
    // MEDIA_UPLOAD_MAX_BYTES and throws on failure, so this should never
    // trip — but a doomed request is never sent regardless.
    if (toUpload.size > MEDIA_UPLOAD_MAX_BYTES) {
      throw new Error("Не удалось сжать фото до нужного размера, попробуйте другое изображение");
    }
    return toUpload;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    const slots = maxImages - valuesRef.current.length;
    if (slots <= 0) {
      toast.error(`Максимум ${maxImages} фотографий`);
      return;
    }
    const batch = files.slice(0, slots);
    if (files.length > slots) {
      toast.error(`Максимум ${maxImages} фотографий — добавлено ${slots} из ${files.length}`);
    }

    const skipAi = isProduct && !aiProcessingEnabled;
    // Only names a file when several were picked — a single pick keeps the
    // exact toast text it always had.
    const failed = (file: File, err: unknown) => {
      const reason = err instanceof Error ? err.message : "Не удалось загрузить изображение";
      toast.error(batch.length > 1 ? `«${file.name}»: ${reason}` : reason);
    };
    const markFinished = () => setProgress((p) => (p ? { ...p, finished: p.finished + 1 } : p));

    setProgress({ total: batch.length, finished: 0 });
    // One slot per picked file, in selection order — the result order comes
    // from this array, never from which request happens to finish first.
    const uploads: Promise<string | null>[] = [];
    for (const file of batch) {
      try {
        const toUpload = await prepareForUpload(file);
        uploads.push(
          uploadImage(toUpload, context, skipAi)
            .catch((err: unknown) => {
              failed(file, err);
              return null;
            })
            .finally(markFinished),
        );
      } catch (err) {
        failed(file, err);
        markFinished();
        uploads.push(Promise.resolve(null));
      }
    }

    const urls = (await Promise.all(uploads)).filter((url): url is string => url !== null);
    setProgress(null);
    if (urls.length > 0) onChange([...valuesRef.current, ...urls]);
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
              disabled={disabled || isUploading}
              className="absolute right-0.5 top-0.5 rounded-full bg-background/90 p-0.5 text-muted-foreground hover:text-destructive"
              aria-label="Удалить изображение"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {!atLimit && (
          <>
            {isProduct && (
              <div
                role="radiogroup"
                aria-label="Режим загрузки фото"
                className="flex items-center gap-0.5 rounded-full border border-border/60 bg-secondary/30 p-0.5 text-xs"
              >
                {/* Задача №275 — "с ИИ" stays a secondary/outline-weight option even
                    when selected (no shadow/bold), so it never competes visually
                    with the default "без ИИ" path; only its own selection state
                    (aria-checked) changes, not the segmented-toggle mechanism. */}
                <button
                  type="button"
                  role="radio"
                  aria-checked={aiProcessingEnabled}
                  disabled={disabled || isBusy}
                  onClick={() => setAiProcessingEnabled(true)}
                  className={cn(
                    "rounded-full px-2.5 py-1 transition-colors",
                    aiProcessingEnabled
                      ? "bg-secondary/70 text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  С обработкой ИИ
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={!aiProcessingEnabled}
                  disabled={disabled || isBusy}
                  onClick={() => setAiProcessingEnabled(false)}
                  className={cn(
                    "rounded-full px-2.5 py-1 transition-colors",
                    !aiProcessingEnabled
                      ? "bg-background font-medium shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Без обработки ИИ
                </button>
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || isBusy}
              onClick={() => inputRef.current?.click()}
            >
              {isBusy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}
              {stage === "converting"
                ? "Конвертируем HEIC..."
                : stage === "compressing"
                  ? "Сжимаем фото..."
                  : progress && progress.total > 1
                    ? `Загружаем ${Math.min(progress.finished + 1, progress.total)} из ${progress.total}...`
                    : "Добавить фото"}
            </Button>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          // Задача №262 — plain wildcard, not an enumerated MIME+extension
          // list: see ImageUploadField.tsx's accept attribute for why
          // (iOS Safari has no support for extension accept values and
          // documented bugs with multi-type/explicit-"image/heic" lists;
          // "image/*" already covers HEIC/HEIF as a MIME-class wildcard).
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled || atLimit}
        />
      </div>
      {atLimit && <p className="text-xs text-muted-foreground">Максимум {maxImages} фотографий</p>}
    </div>
  );
}
