import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { signInWithGoogle } from "@/lib/auth";
import { getBootstrapStatus, claimBootstrap } from "@/api/bootstrap";

export const Route = createFileRoute("/bootstrap")({
  component: BootstrapPage,
});

/**
 * The one screen Platform Initialization ever shows (docs/architecture/
 * PLATFORM_INITIALIZATION_ARCHITECTURE.md §9). No SiteHeader/SiteFooter here on
 * purpose — this predates the platform having any owner, so no Customer Workspace
 * chrome (search/cart/account menu) makes sense yet; styled like __root.tsx's own
 * NotFoundComponent/ErrorComponent (centered card, no site chrome).
 */
type ViewState =
  "loading" | "eligible" | "claiming" | "completed-by-me" | "already-completed" | "error";

function BootstrapPage() {
  const [state, setState] = useState<ViewState>("loading");
  const { isAuthenticated } = useSupabaseSession();

  const checkStatus = () => {
    setState("loading");
    getBootstrapStatus()
      .then(({ eligibility }) => {
        setState(eligibility === "ELIGIBLE" ? "eligible" : "already-completed");
      })
      .catch(() => setState("error"));
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleClaim = async () => {
    setState("claiming");
    try {
      const result = await claimBootstrap();
      setState(result.eligibility === "COMPLETED" ? "completed-by-me" : "eligible");
    } catch {
      // Race: someone else's claim won between our status check and this
      // click — re-check the real status rather than assuming why it failed.
      checkStatus();
    }
  };

  const handleSignIn = () => {
    void signInWithGoogle();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        {state === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Проверка состояния платформы…</p>
          </div>
        )}

        {state === "eligible" && (
          <>
            <h1 className="font-serif text-3xl tracking-tight">Инициализация платформы</h1>
            <p className="mt-3 text-muted-foreground">
              У платформы «Местный Базар» ещё нет владельца. Первый вошедший пользователь может
              стать Root Owner — это происходит только один раз.
            </p>
            <div className="mt-6">
              {isAuthenticated === null ? (
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
              ) : isAuthenticated ? (
                <Button size="lg" className="h-12 rounded-full" onClick={() => void handleClaim()}>
                  Стать Root Owner
                </Button>
              ) : (
                <Button size="lg" className="h-12 rounded-full" onClick={handleSignIn}>
                  Войти через Google
                </Button>
              )}
            </div>
          </>
        )}

        {state === "claiming" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Подтверждение…</p>
          </div>
        )}

        {state === "completed-by-me" && (
          <>
            <h1 className="font-serif text-3xl tracking-tight">Готово</h1>
            <p className="mt-3 text-muted-foreground">
              Вы стали первым Root Owner платформы «Местный Базар».
            </p>
            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Перейти на платформу
              </Link>
            </div>
          </>
        )}

        {state === "already-completed" && (
          <>
            <h1 className="font-serif text-3xl tracking-tight">Bootstrap уже завершён</h1>
            <p className="mt-3 text-muted-foreground">
              У платформы «Местный Базар» уже есть владелец. Инициализация выполняется только один
              раз.
            </p>
            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                На главную
              </Link>
            </div>
          </>
        )}

        {state === "error" && (
          <>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Не удалось проверить состояние платформы
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Что-то пошло не так. Попробуйте ещё раз.
            </p>
            <div className="mt-6">
              <button
                onClick={checkStatus}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Повторить
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
