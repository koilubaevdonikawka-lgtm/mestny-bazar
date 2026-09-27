import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listGuestCustomers } from "@/api/user-admin";
import { formatOrderDate, formatTelHref } from "@shared/lib/order-display";

const PAGE_SIZE = 50;

/**
 * Guests (orders.user_id = NULL) grouped by the phone typed at checkout —
 * rendered alongside the account list but deliberately without role/scope
 * badges or a block button: there is no profiles row to apply them to.
 */
export function GuestCustomersList() {
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["admin", "users", "guests"],
      queryFn: ({ pageParam }) => listGuestCustomers({ offset: pageParam, limit: PAGE_SIZE }),
      initialPageParam: 0,
      getNextPageParam: (lastPage, pages) =>
        lastPage.hasMore ? pages.reduce((sum, page) => sum + page.items.length, 0) : undefined,
      retry: false,
    });

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="py-4 text-sm text-muted-foreground">
        {error instanceof Error ? error.message : "Не удалось загрузить гостей"}
      </p>
    );
  }

  const guests = data?.pages.flatMap((page) => page.items) ?? [];
  const firstPage = data?.pages[0];

  if (guests.length === 0) {
    return <p className="py-4 text-sm text-muted-foreground">Гостевых заказов пока нет.</p>;
  }

  return (
    <>
      <ul className="space-y-4">
        {guests.map((guest) => (
          <li
            key={guest.phone}
            className="rounded-xl border border-dashed border-border/80 bg-muted/30 px-4 py-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <a href={formatTelHref(guest.phone)} className="font-medium hover:underline">
                +{guest.phone.replace(/^\+/, "")}
              </a>
              <Badge variant="outline">Гость</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Заказов: {guest.ordersCount} · первый {formatOrderDate(guest.firstOrderAt)} ·
              последний {formatOrderDate(guest.lastOrderAt)}
            </p>
          </li>
        ))}
      </ul>

      {hasNextPage && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            disabled={isFetchingNextPage}
            onClick={() => void fetchNextPage()}
          >
            {isFetchingNextPage ? <Loader2 className="h-4 w-4 animate-spin" /> : "Показать ещё"}
          </Button>
        </div>
      )}

      {firstPage?.truncated && (
        <p className="mt-3 text-xs text-muted-foreground">
          Учтены только последние {firstPage.scanLimit} гостевых заказов — более ранние гости здесь
          не показаны.
        </p>
      )}
    </>
  );
}
