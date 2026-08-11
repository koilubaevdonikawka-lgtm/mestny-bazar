import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
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
import { ImageUploadField } from "@/components/shared/ImageUploadField";
import {
  blockCourier as blockCourierApi,
  getCourierProfile,
  listCourierOrderHistory,
  unblockCourier as unblockCourierApi,
  updateCourierProfile,
} from "@/api/courier-profile";
import { listAdminDeliveryZones } from "@/api/delivery-zone";
import {
  CourierProfileStatus,
  CourierVehicleType,
  type CourierProfileDTO,
} from "@shared/contracts/courier-profile";
import { OrderStatus, type OrderStatus as OrderStatusType } from "@shared/contracts/order";
import { formatMoney, formatOrderDate, formatOrderStatus } from "@shared/lib/order-display";
import { formatVehicleType } from "@shared/lib/courier-display";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { ArrowLeft, Loader2, LogIn, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/couriers/$id")({
  component: AdminCourierDetailPage,
});

const ACTIVE_STATUSES = new Set<OrderStatusType>([
  OrderStatus.READY_FOR_DELIVERY,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.ARRIVED,
]);

function AdminCourierDetailPage() {
  const { id } = Route.useParams();
  const { isAuthenticated } = useSupabaseSession();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const profileQuery = useQuery({
    queryKey: ["admin", "couriers", id],
    queryFn: () => getCourierProfile(id),
    enabled: isAuthenticated === true,
    retry: false,
  });

  const historyQuery = useQuery({
    queryKey: ["admin", "couriers", id, "orders"],
    queryFn: () => listCourierOrderHistory(id),
    enabled: isAuthenticated === true,
  });

  const zonesQuery = useQuery({
    queryKey: ["admin", "delivery-zones", "admin-list"],
    queryFn: listAdminDeliveryZones,
    enabled: isAuthenticated === true,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "couriers", id] });
    queryClient.invalidateQueries({ queryKey: ["admin", "couriers", "list"] });
  };

  const blockMutation = useMutation({
    mutationFn: () => blockCourierApi(id),
    onSuccess: () => {
      invalidate();
      toast.success("Курьер заблокирован");
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Не удалось заблокировать курьера"),
  });

  const unblockMutation = useMutation({
    mutationFn: () => unblockCourierApi(id),
    onSuccess: () => {
      invalidate();
      toast.success("Курьер разблокирован");
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Не удалось разблокировать курьера"),
  });

  const updateMutation = useMutation({
    mutationFn: updateCourierProfile,
    onSuccess: () => {
      invalidate();
      toast.success("Профиль обновлён");
      setIsEditing(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось обновить профиль"),
  });

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

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
          <h1 className="font-serif text-3xl tracking-tight">Курьер</h1>
          <p className="mt-3 text-muted-foreground">Войдите с учётной записью администратора.</p>
          <Button size="lg" className="mt-6 h-12 rounded-full" onClick={() => void handleSignIn()}>
            Войти
          </Button>
        </div>
      </AdminLayout>
    );
  }

  if (profileQuery.isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    const message =
      profileQuery.error instanceof Error ? profileQuery.error.message : "Курьер не найден";
    const isForbidden =
      message.toLowerCase().includes("access denied") ||
      message.toLowerCase().includes("admin role") ||
      message.toLowerCase().includes("permission denied");

    return (
      <AdminLayout>
        <div className="max-w-md mx-auto text-center py-24">
          <ShieldAlert className="h-10 w-10 text-primary mx-auto mb-4" />
          <h1 className="font-serif text-3xl tracking-tight">
            {isForbidden ? "Доступ запрещён" : "Курьер не найден"}
          </h1>
          <p className="mt-3 text-muted-foreground">{isForbidden ? "" : message}</p>
        </div>
      </AdminLayout>
    );
  }

  const profile = profileQuery.data;
  const orders = historyQuery.data?.items ?? [];
  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.has(o.status));

  return (
    <AdminLayout>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Button asChild variant="ghost" className="mb-6 -ml-2 rounded-full">
          <Link to="/admin/couriers">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Курьеры
          </Link>
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            {profile.photoUrl && (
              <img
                src={profile.photoUrl}
                alt=""
                className="h-16 w-16 rounded-full object-cover border border-border/60"
              />
            )}
            <div>
              <h1 className="font-serif text-3xl tracking-tight">
                {[profile.lastName, profile.firstName, profile.middleName]
                  .filter(Boolean)
                  .join(" ")}
              </h1>
              <p className="text-muted-foreground">{profile.phone}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={profile.status === CourierProfileStatus.ACTIVE ? "secondary" : "destructive"}
            >
              {profile.status === CourierProfileStatus.ACTIVE ? "Активен" : "Заблокирован"}
            </Badge>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setIsEditing((v) => !v)}>
            {isEditing ? "Отмена" : "Редактировать"}
          </Button>
          {profile.status === CourierProfileStatus.ACTIVE ? (
            <Button
              variant="destructive"
              disabled={blockMutation.isPending}
              onClick={() => blockMutation.mutate()}
            >
              Заблокировать
            </Button>
          ) : (
            <Button disabled={unblockMutation.isPending} onClick={() => unblockMutation.mutate()}>
              Разблокировать
            </Button>
          )}
        </div>

        {isEditing && (
          <EditCourierForm
            profile={profile}
            zones={zonesQuery.data ?? []}
            isSaving={updateMutation.isPending}
            onSave={(data) => updateMutation.mutate({ userId: id, ...data })}
          />
        )}

        <section className="mt-8 rounded-2xl border border-border/60 bg-card p-6">
          <h2 className="font-serif text-2xl mb-4">Карточка</h2>
          <dl className="grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Транспорт</dt>
              <dd>{formatVehicleType(profile.vehicleType)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Гос. номер</dt>
              <dd>{profile.plateNumber ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Район обслуживания</dt>
              <dd>{zonesQuery.data?.find((z) => z.id === profile.serviceZoneId)?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Дата приёма</dt>
              <dd>{profile.hiredAt ?? "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Комментарий администратора</dt>
              <dd>{profile.adminComment ?? "—"}</dd>
            </div>
          </dl>
        </section>

        <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
          <h2 className="font-serif text-2xl mb-4">Активные назначения ({activeOrders.length})</h2>
          {activeOrders.length === 0 ? (
            <p className="text-muted-foreground">Активных заказов нет.</p>
          ) : (
            <ul className="space-y-2">
              {activeOrders.map((order) => (
                <li
                  key={order.id}
                  className="rounded-xl bg-secondary/40 px-4 py-3 flex items-center justify-between"
                >
                  <Link
                    to="/admin/orders/$id"
                    params={{ id: order.id }}
                    className="font-medium hover:underline"
                  >
                    №{order.orderNumber}
                  </Link>
                  <Badge variant="outline">{formatOrderStatus(order.status)}</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
          <h2 className="font-serif text-2xl mb-4">История заказов</h2>
          {orders.length === 0 ? (
            <p className="text-muted-foreground">Заказов пока нет.</p>
          ) : (
            <ul className="space-y-2">
              {orders.map((order) => (
                <li key={order.id} className="rounded-xl bg-secondary/40 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      to="/admin/orders/$id"
                      params={{ id: order.id }}
                      className="font-medium hover:underline"
                    >
                      №{order.orderNumber}
                    </Link>
                    <Badge variant="outline">{formatOrderStatus(order.status)}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatOrderDate(order.createdAt)} · {formatMoney(order.total, order.currency)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}

interface EditCourierFormProps {
  profile: CourierProfileDTO;
  zones: { id: string; name: string }[];
  isSaving: boolean;
  onSave: (data: {
    lastName: string;
    firstName: string;
    middleName: string | null;
    phone: string;
    vehicleType: CourierVehicleType;
    plateNumber: string | null;
    serviceZoneId: string | null;
    photoUrl: string | null;
    adminComment: string | null;
  }) => void;
}

function EditCourierForm({ profile, zones, isSaving, onSave }: EditCourierFormProps) {
  const [lastName, setLastName] = useState(profile.lastName);
  const [firstName, setFirstName] = useState(profile.firstName);
  const [middleName, setMiddleName] = useState(profile.middleName ?? "");
  const [phone, setPhone] = useState(profile.phone);
  const [vehicleType, setVehicleType] = useState<string>(profile.vehicleType);
  const [plateNumber, setPlateNumber] = useState(profile.plateNumber ?? "");
  const [serviceZoneId, setServiceZoneId] = useState(profile.serviceZoneId ?? "");
  const [photoUrl, setPhotoUrl] = useState<string | null>(profile.photoUrl);
  const [adminComment, setAdminComment] = useState(profile.adminComment ?? "");

  return (
    <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
      <h2 className="font-serif text-2xl mb-4">Редактирование</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="e-last">Фамилия</Label>
          <Input id="e-last" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="e-first">Имя</Label>
          <Input id="e-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="e-middle">Отчество</Label>
          <Input id="e-middle" value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="e-phone">Телефон</Label>
          <Input id="e-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
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
          <Label htmlFor="e-plate">Гос. номер</Label>
          <Input
            id="e-plate"
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
              {zones.map((zone) => (
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
          <Label htmlFor="e-comment">Комментарий администратора</Label>
          <Input
            id="e-comment"
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
          />
        </div>
      </div>
      <Button
        className="mt-4 rounded-full"
        disabled={isSaving}
        onClick={() =>
          onSave({
            lastName: lastName.trim(),
            firstName: firstName.trim(),
            middleName: middleName.trim() || null,
            phone: phone.trim(),
            vehicleType: vehicleType as CourierVehicleType,
            plateNumber: plateNumber.trim() || null,
            serviceZoneId: serviceZoneId || null,
            photoUrl,
            adminComment: adminComment.trim() || null,
          })
        }
      >
        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Сохранить"}
      </Button>
    </section>
  );
}
