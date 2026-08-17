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

interface ImageUploadFieldProps {
  value: string | null;
  onChange: (url: string | null) => void;
  context: MediaUploadContext;
  label?: string;
  disabled?: boolean;
}

/**
 * Единый механизм загрузки изображений (Промпт №068) — заменяет ручной ввод
 * URL во всех формах (категории, баннеры, товары продавца, курьеры). Кнопка
 * открывает стандартный File Picker ОС; после выбора файл сразу загружается
 * в хранилище, ссылка сохраняется автоматически, предпросмотр показывается
 * сразу — ручная вставка URL не требуется нигде.
 */
export function ImageUploadField({
  value,
  onChange,
  context,
  label = "Изображение",
  disabled,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: (file: File) => uploadImage(file, context),
    onSuccess: (url) => onChange(url),
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

  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium leading-none">{label}</span>
      <div className="flex flex-wrap items-center gap-3">
        {value && (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-secondary/40">
            <img src={value} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(null)}
              disabled={disabled || mutation.isPending}
              className="absolute right-0.5 top-0.5 rounded-full bg-background/90 p-0.5 text-muted-foreground hover:text-destructive"
              aria-label="Удалить изображение"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
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
          {value ? "Заменить" : "Загрузить изображение"}
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
