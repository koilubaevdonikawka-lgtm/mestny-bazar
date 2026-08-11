import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/api/media-upload";
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
  disabled?: boolean;
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
  disabled,
}: MultiImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: (file: File) => uploadImage(file, context),
    onSuccess: (url) => onChange([...values, url]),
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Не удалось загрузить изображение"),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!(MEDIA_UPLOAD_ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
      toast.error("Поддерживаются только изображения PNG, JPEG, WEBP или AVIF");
      return;
    }
    if (file.size > MEDIA_UPLOAD_MAX_BYTES) {
      toast.error("Размер файла не должен превышать 5 МБ");
      return;
    }
    mutation.mutate(file);
  };

  const removeAt = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium leading-none">{label}</span>
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || mutation.isPending}
          onClick={() => inputRef.current?.click()}
        >
          {mutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
          Добавить фото
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={MEDIA_UPLOAD_ALLOWED_MIME_TYPES.join(",")}
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
