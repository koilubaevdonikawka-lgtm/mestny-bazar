import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { signInWithGoogle } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, MapPin, Package, User } from "lucide-react";
import { toast } from "sonner";

export function AccountMenu() {
  const { isAuthenticated } = useSupabaseSession();

  const handleSignIn = async () => {
    await signInWithGoogle(window.location.origin);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Вы вышли из аккаунта");
  };

  if (isAuthenticated === null) {
    return (
      <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full" disabled>
        <User className="h-4 w-4" />
      </Button>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button
        variant="outline"
        className="h-11 rounded-full px-4"
        onClick={() => void handleSignIn()}
      >
        Войти
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full" aria-label="Аккаунт">
          <User className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <Link to="/orders" className="cursor-pointer">
            <Package className="h-4 w-4" />
            Мои заказы
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/profile/addresses" className="cursor-pointer">
            <MapPin className="h-4 w-4" />
            Адреса доставки
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void handleSignOut()} className="cursor-pointer">
          <LogOut className="h-4 w-4" />
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
