import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getMySellerProfile, upsertMySellerProfile } from "@/api/seller-profile";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { ArrowLeft, LogIn, Loader2, ShieldAlert, Store } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/seller/profile/")({
  component: SellerProfilePage,
});

const STATUS_LABEL: Record<string, string> = {
  PENDING: "На проверке",
  VERIFIED: "Проверен",
  REJECTED: "Отклонён",
};

function SellerProfilePage() {
  const { isAuthenticated } = useSupabaseSession();
  const queryClient = useQueryClient();
  const [storeName, setStoreName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [payoutDetails, setPayoutDetails] = useState("");

  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["seller", "profile"],
    queryFn: getMySellerProfile,
    enabled: isAuthenticated === true,
    retry: false,
  });

  useEffect(() => {
    if (profile) {
      setStoreName(profile.storeName);
      setContactPhone(profile.contactPhone ?? "");
      setPayoutDetails(profile.payoutDetails ?? "");
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: upsertMySellerProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller", "profile"] });
      toast.success("Профиль сохранён");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось сохранить профиль"),
  });

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim() || storeName.trim().length < 2) {
      toast.error("Название магазина должно содержать минимум 2 символа");
      return;
    }
    saveMutation.mutate({
      storeName: storeName.trim(),
      contactPhone: contactPhone.trim() || null,
      payoutDetails: payoutDetails.trim() || null,
    });
  };

  if (isAuthenticated === null) {
    return (
      <PageShell>
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageShell>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageShell>
        <div className="max-w-md mx-auto text-center py-24">
          <LogIn className="h-10 w-10 text-primary mx-auto mb-4" />
          <h1 className="font-serif text-3xl tracking-tight">Профиль магазина</h1>
          <p className="mt-3 text-muted-foreground">Войдите с учётной записью продавца.</p>
          <Button size="lg" className="mt-6 h-12 rounded-full" onClick={() => void handleSignIn()}>
            Войти
          </Button>
        </div>
      </PageShell>
    );
  }

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageShell>
    );
  }

  if (isError) {
    const message = error instanceof Error ? error.message : "Не удалось загрузить профиль";
    const isForbidden =
      message.toLowerCase().includes("access denied") ||
      message.toLowerCase().includes("seller role");

    return (
      <PageShell>
        <div className="max-w-md mx-auto text-center py-24">
          {isForbidden ? (
            <>
              <ShieldAlert className="h-10 w-10 text-primary mx-auto mb-4" />
              <h1 className="font-serif text-3xl tracking-tight">Доступ запрещён</h1>
              <p className="mt-3 text-muted-foreground">Эта страница доступна только продавцам.</p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">{message}</p>
              <Button size="lg" className="mt-6 h-12 rounded-full" onClick={() => void refetch()}>
                Повторить
              </Button>
            </>
          )}
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-xl px-6 py-12">
        <Button asChild variant="ghost" className="mb-6 -ml-2 rounded-full">
          <Link to="/seller/products">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Мои товары
          </Link>
        </Button>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-serif text-4xl tracking-tight">Профиль магазина</h1>
          {profile && (
            <Badge variant={profile.verificationStatus === "VERIFIED" ? "secondary" : "outline"}>
              {STATUS_LABEL[profile.verificationStatus]}
            </Badge>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl border border-border/60 bg-card p-6 space-y-4"
        >
          {!profile && (
            <div className="flex items-center gap-3 rounded-xl bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
              <Store className="h-4 w-4 flex-shrink-0" />
              Профиль ещё не создан — заполните и сохраните форму ниже.
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="store-name">Название магазина *</Label>
            <Input
              id="store-name"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              maxLength={200}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-phone">Контактный телефон</Label>
            <Input
              id="contact-phone"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              maxLength={30}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payout-details">Реквизиты для выплат</Label>
            <Input
              id="payout-details"
              value={payoutDetails}
              onChange={(e) => setPayoutDetails(e.target.value)}
              maxLength={1000}
            />
          </div>
          <Button type="submit" className="h-12 rounded-full" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Сохранить"}
          </Button>
        </form>
      </div>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
