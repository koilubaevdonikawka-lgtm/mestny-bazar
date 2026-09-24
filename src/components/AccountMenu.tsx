import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SignInMethodsList } from "@/components/auth/SignInMethodsList";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { supabase } from "@/integrations/supabase/client";
import { WELCOME_SEEN_KEY } from "@/components/WelcomeGate";
import { LogOut, MapPin, Package, User } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/i18n/LanguageProvider";

interface AccountMenuProps {
  /**
   * Скрывает кнопку "Войти" в header для неавторизованных гостей — вход
   * теперь предлагается один раз через WelcomeGate при первом визите, а не
   * постоянной кнопкой в шапке (Часть 2 задачи о пользовательской панели).
   * По умолчанию false — админ/сервисные страницы, использующие тот же
   * SiteHeader, сохраняют прежнее поведение без изменений.
   */
  hideSignInCta?: boolean;
}

export function AccountMenu({ hideSignInCta = false }: AccountMenuProps = {}) {
  const { t } = useTranslation();
  const { isAuthenticated } = useSupabaseSession();
  const [signInOpen, setSignInOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // Shared-device case: the next person on this browser should see
    // WelcomeGate again, not silently inherit "already seen" from whoever
    // signed out.
    window.localStorage.removeItem(WELCOME_SEEN_KEY);
    toast.success(t("account.signedOutToast"));
  };

  if (isAuthenticated === null) {
    return (
      <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full" disabled>
        <User className="h-4 w-4" />
      </Button>
    );
  }

  if (!isAuthenticated) {
    if (hideSignInCta) return null;
    // Задача №303 — one "Войти" button opens a popover listing every
    // sign-in method (SignInMethodsList — the single place that list
    // lives, shared with RegisterPromptDialog and addresses.tsx), instead
    // of a Google button and Telegram's widget sitting side by side in the
    // header. `modal={false}` (Radix Popover's own default, set explicitly
    // here) is what keeps this safe with Telegram's real iframe inside:
    // a modal popover's focus trap can fight an iframe for focus the
    // instant the buyer clicks into it — confirmed working live with this
    // setting, not merely assumed.
    return (
      <Popover open={signInOpen} onOpenChange={setSignInOpen} modal={false}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-11 rounded-full px-4">
            {t("common.signIn")}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64">
          <p className="mb-3 text-sm font-medium text-foreground">{t("auth.chooseMethod")}</p>
          <SignInMethodsList onActionSelected={() => setSignInOpen(false)} />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 rounded-full"
          aria-label={t("account.menuAriaLabel")}
        >
          <User className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <Link to="/orders" className="cursor-pointer">
            <Package className="h-4 w-4" />
            {t("orders.title")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/profile/addresses" className="cursor-pointer">
            <MapPin className="h-4 w-4" />
            {t("addresses.title")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void handleSignOut()} className="cursor-pointer">
          <LogOut className="h-4 w-4" />
          {t("common.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
