import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImageUploadField } from "@/components/shared/ImageUploadField";
import { listCouriers } from "@/api/courier-admin";
import { bulkSetCourierStatus, createCourier } from "@/api/courier-profile";
import { listUsers } from "@/api/user-admin";
import { listAdminDeliveryZones } from "@/api/delivery-zone";
import {
  CourierProfileStatus,
  CourierVehicleType,
  type CourierListItemDTO,
} from "@shared/contracts/courier-profile";
import { formatVehicleType } from "@shared/lib/courier-display";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { ArrowLeft, Bike, Loader2, LogIn, ShieldAlert, UserPlus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/couriers/")({
  component: AdminCouriersPage,
});

function courierName(c: CourierListItemDTO): string {
  return [c.lastName, c.firstName, c.middleName].filter(Boolean).join(" ");
}

function AdminCouriersPage() {
  const { isAuthenticated } = useSupabaseSession();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  const couriersQuery = useQuery({
    queryKey: ["admin", "couriers", "list"],
    queryFn: listCouriers,
    enabled: isAuthenticated === true,
    retry: false,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "couriers", "list"] });

  const bulkBlockMutation = useMutation({
    mutationFn: (userIds: string[]) =>
      bulkSetCourierStatus({ userIds, status: CourierProfileStatus.BLOCKED }),
    onSuccess: () => {
      invalidate();
      toast.success("Курьеры заблокированы");
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Не удалось заблокировать курьеров"),
  });

  const bulkUnblockMutation = useMutation({
    mutationFn: (userIds: string[]) =>
      bulkSetCourierStatus({ userIds, status: CourierProfileStatus.ACTIVE }),
    onSuccess: () => {
      invalidate();
      toast.success("Курьеры разблокированы");
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Не удалось разблокировать курьеров"),
  });

  if (isAuthenticated === null) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminLayout>
        <div className="max-w-md mx-auto text-center py-24">
          <LogIn className="h-10 w-10 text-primary mx-auto mb-4" />
          <h1 className="font-serif text-3xl tracking-tight">Курьеры</h1>
          <p className="mt-3 text-muted-foreground">Войдите с учётной записью администратора.</p>
          <Button size="lg" className="mt-6 h-12 rounded-full" onClick={() => void handleSignIn()}>
            Войти
          </Button>
        </div>
      </AdminLayout>
    );
  }

  if (couriersQuery.isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (couriersQuery.isError) {
    const message =
      couriersQuery.error instanceof Error
        ? couriersQuery.error.message
        : "Не удалось загрузить курьеров";
    const isForbidden =
      message.toLowerCase().includes("access denied") ||
      message.toLowerCase().includes("admin role") ||
      message.toLowerCase().includes("permission denied");

    return (
      <AdminLayout>
        <div className="max-w-md mx-auto text-center py-24">
          {isForbidden ? (
            <>
              <ShieldAlert className="h-10 w-10 text-primary mx-auto mb-4" />
              <h1 className="font-serif text-3xl tracking-tight">Доступ запрещён</h1>
              <p className="mt-3 text-muted-foreground">
                Эта страница доступна только пользователям с ролью, дающей доступ к модулю
                «Курьеры».
              </p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">{message}</p>
              <Button
                size="lg"
                className="mt-6 h-12 rounded-full"
                onClick={() => void couriersQuery.refetch()}
              >
                Повторить
              </Button>
            </>
          )}
        </div>
      </AdminLayout>
    );
  }

  const couriers = couriersQuery.data ?? [];

  return (
    <AdminLayout>
      <div className="mx-auto max-w-5xl px-6 py-12">
        <Button asChild variant="ghost" className="mb-6 -ml-2 rounded-full">
          <Link to="/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Административная платформа
          </Link>
        </Button>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Bike className="h-7 w-7 text-primary" />
            <h1 className="font-serif text-4xl tracking-tight">Курьеры</h1>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Создать курьера
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
              <CreateCourierDialog
                onDone={() => {
                  setCreateOpen(false);
                  invalidate();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
        <p className="mt-2 text-muted-foreground">
          Профили курьеров, статус, назначения и история заказов.
        </p>

        <div className="mt-8">
          <AdminDataTable
            rows={couriers}
            getRowId={(c) => c.userId}
            selectable
            searchFn={(c, q) => courierName(c).toLowerCase().includes(q) || c.phone.includes(q)}
            searchPlaceholder="Поиск по имени или телефону..."
            bulkActions={[
              {
                label: "Заблокировать",
                variant: "destructive",
                onClick: (ids) => bulkBlockMutation.mutate(ids),
              },
              {
                label: "Разблокировать",
                variant: "outline",
                onClick: (ids) => bulkUnblockMutation.mutate(ids),
              },
            ]}
            columns={[
              {
                key: "name",
                header: "Курьер",
                sortable: true,
                sortValue: (c) => courierName(c),
                render: (c) => (
                  <div className="min-w-0">
                    <p className="font-medium truncate">{courierName(c)}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.phone}</p>
                  </div>
                ),
              },
              {
                key: "vehicle",
                header: "Транспорт",
                className: "w-32 shrink-0",
                render: (c) => formatVehicleType(c.vehicleType),
              },
              {
                key: "online",
                header: "Онлайн",
                className: "w-28 shrink-0",
                render: (c) => (
                  <Badge variant={c.isAvailable ? "secondary" : "outline"}>
                    {c.isAvailable ? "Доступен" : "Недоступен"}
                  </Badge>
                ),
              },
              {
                key: "status",
                header: "Статус",
                className: "w-28 shrink-0",
                render: (c) => (
                  <Badge
                    variant={c.status === CourierProfileStatus.ACTIVE ? "secondary" : "destructive"}
                  >
                    {c.status === CourierProfileStatus.ACTIVE ? "Активен" : "Заблокирован"}
                  </Badge>
                ),
              },
              {
                key: "deliveries",
                header: "Заказов сейчас",
                className: "w-32 shrink-0",
                sortable: true,
                sortValue: (c) => c.activeDeliveries,
                render: (c) => c.activeDeliveries,
              },
            ]}
            rowActions={(c) => (
              <Button asChild variant="outline" size="sm">
                <Link to="/admin/couriers/$id" params={{ id: c.userId }}>
                  Открыть
                </Link>
              </Button>
            )}
            emptyState="Курьеров пока нет."
          />
        </div>
      </div>
    </AdminLayout>
  );
}

function CreateCourierDialog({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<"search" | "form">("search");
  const [query, setQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleType, setVehicleType] = useState<string>(CourierVehicleType.ON_FOOT);
  const [plateNumber, setPlateNumber] = useState("");
  const [serviceZoneId, setServiceZoneId] = useState<string>("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [adminComment, setAdminComment] = useState("");

  const usersQuery = useQuery({ queryKey: ["admin", "users", "list"], queryFn: listUsers });
  const zonesQuery = useQuery({
    queryKey: ["admin", "delivery-zones", "admin-list"],
    queryFn: listAdminDeliveryZones,
  });
  const couriersQuery = useQuery({
    queryKey: ["admin", "couriers", "list"],
    queryFn: listCouriers,
  });

  const createMutation = useMutation({
    mutationFn: createCourier,
    onSuccess: () => {
      toast.success("Курьер создан");
      onDone();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось создать курьера"),
  });

  const existingCourierIds = new Set((couriersQuery.data ?? []).map((c) => c.userId));
  const candidates = (usersQuery.data ?? []).filter((u) => {
    if (existingCourierIds.has(u.id)) return false;
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return (u.fullName ?? "").toLowerCase().includes(q) || (u.phone ?? "").includes(q);
  });

  if (step === "search") {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Выберите пользователя</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по имени или телефону..."
          />
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {candidates.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Пользователи не найдены.
              </p>
            )}
            {candidates.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  setSelectedUserId(u.id);
                  setPhone(u.phone ?? "");
                  const [first, ...rest] = (u.fullName ?? "").split(" ");
                  setFirstName(first ?? "");
                  setLastName(rest.join(" "));
                  setStep("form");
                }}
                className="w-full rounded-lg bg-secondary/40 px-3 py-2 text-left text-sm hover:bg-secondary/60"
              >
                <p className="font-medium">{u.fullName ?? "Без имени"}</p>
                <p className="text-xs text-muted-foreground">{u.phone ?? "—"}</p>
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Данные курьера</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="c-last">Фамилия</Label>
          <Input id="c-last" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="c-first">Имя</Label>
          <Input id="c-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="c-middle">Отчество</Label>
          <Input id="c-middle" value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="c-phone">Телефон</Label>
          <Input id="c-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>Тип транспорта</Label>
          <Select value={vehicleType} onValueChange={setVehicleType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(CourierVehicleType).map((v) => (
                <SelectItem key={v} value={v}>
                  {formatVehicleType(v)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="c-plate">Гос. номер</Label>
          <Input
            id="c-plate"
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value)}
          />
        </div>
        <div className="grid gap-2 sm:col-span-2">
          <Label>Район обслуживания</Label>
          <Select value={serviceZoneId} onValueChange={setServiceZoneId}>
            <SelectTrigger>
              <SelectValue placeholder="Не выбран" />
            </SelectTrigger>
            <SelectContent>
              {(zonesQuery.data ?? []).map((zone) => (
                <SelectItem key={zone.id} value={zone.id}>
                  {zone.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2 sm:col-span-2">
          <ImageUploadField
            value={photoUrl}
            onChange={setPhotoUrl}
            context="courier"
            label="Фотография"
          />
        </div>
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="c-comment">Комментарий администратора</Label>
          <Input
            id="c-comment"
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
          />
        </div>
      </div>
      <DialogFooter className="mt-4">
        <Button variant="ghost" onClick={() => setStep("search")}>
          Назад
        </Button>
        <Button
          disabled={createMutation.isPending}
          onClick={() => {
            if (!selectedUserId) return;
            if (!lastName.trim() || !firstName.trim()) {
              toast.error("Укажите фамилию и имя");
              return;
            }
            if (phone.trim().length < 5) {
              toast.error("Укажите корректный телефон");
              return;
            }
            createMutation.mutate({
              userId: selectedUserId,
              lastName: lastName.trim(),
              firstName: firstName.trim(),
              middleName: middleName.trim() || null,
              phone: phone.trim(),
              vehicleType: vehicleType as CourierVehicleType,
              plateNumber: plateNumber.trim() || null,
              serviceZoneId: serviceZoneId || null,
              photoUrl,
              adminComment: adminComment.trim() || null,
            });
          }}
        >
          {createMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Создать курьера"
          )}
        </Button>
      </DialogFooter>
    </>
  );
}
