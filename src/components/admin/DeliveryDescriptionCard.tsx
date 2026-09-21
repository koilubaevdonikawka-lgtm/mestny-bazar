import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { listSettings, updateSetting } from "@/api/settings";
import {
  DELIVERY_DESCRIPTION_SETTING_CATEGORY,
  DELIVERY_DESCRIPTION_SETTING_KEY,
} from "@shared/contracts/settings";

const MAX_LENGTH = 2000;

/**
 * Задача №296 — the text customers see under "Доставка" on the public
 * «Информация» page. Stored as one key in the same platform settings table as
 * the admin contact phone (Задача №274); an empty text hides the block there.
 * Shared by the simple and the advanced view of the admin "Доставка" screen.
 */
export function DeliveryDescriptionCard() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<string | null>(null);

  const settingsQuery = useQuery({
    queryKey: ["admin", "settings", "list"],
    queryFn: listSettings,
    retry: false,
  });

  const saved = settingsQuery.data?.find((s) => s.key === DELIVERY_DESCRIPTION_SETTING_KEY)?.value;
  const savedText = typeof saved === "string" ? saved : "";
  const text = draft ?? savedText;

  useEffect(() => {
    setDraft(null);
  }, [savedText]);

  const saveMutation = useMutation({
    mutationFn: (value: string) =>
      updateSetting({
        key: DELIVERY_DESCRIPTION_SETTING_KEY,
        category: DELIVERY_DESCRIPTION_SETTING_CATEGORY,
        value,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "settings", "list"] });
      void queryClient.invalidateQueries({ queryKey: ["public", "delivery-description"] });
      toast.success("Описание доставки сохранено");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось сохранить описание"),
  });

  return (
    <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
      <h2 className="font-serif text-2xl mb-1">Описание доставки для покупателей</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Этот текст покупатели видят на странице «Информация», в разделе «Доставка». Если оставить
        поле пустым, раздел с описанием не показывается.
      </p>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="delivery-description">Описание доставки</Label>
          <Textarea
            id="delivery-description"
            value={text}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Например: доставляем по Канту ежедневно с 9:00 до 20:00"
            rows={4}
            maxLength={MAX_LENGTH}
            disabled={settingsQuery.isLoading}
          />
        </div>
        <Button
          type="button"
          className="h-12 w-full rounded-full sm:w-auto"
          disabled={saveMutation.isPending || settingsQuery.isLoading}
          onClick={() => saveMutation.mutate(text.trim())}
        >
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Сохранить"}
        </Button>
      </div>
    </section>
  );
}
