import type { AutomationEventSummary, AutomationOverviewDTO } from "@shared/contracts/automation";

/**
 * automation.md — a hand-maintained map of server/di/container.ts's actual
 * subscriber wiring (subscribeAuditLog, subscribeNotificationCenter,
 * subscribeAIWorkers). There is no runtime registry to introspect (the event
 * bus is a compile-time union + subscribe/publish, not a discoverable
 * catalog) — this list must be kept in sync by hand when a new event or
 * subscription is added, the same documented constraint every static
 * overview in this stage carries (see IMPLEMENTATION_ORDER.md, Этап 5,
 * "Известные ограничения").
 */
const EVENT_CATALOG: AutomationEventSummary[] = [
  { eventType: "order.created", description: "Новый заказ создан", subscribers: ["AuditLog"] },
  { eventType: "order.cancelled", description: "Заказ отменён", subscribers: ["AuditLog"] },
  {
    eventType: "order.operational_cascade_started",
    description: "Буфер отмены истёк — запуск операционного каскада (platform-lifecycle.md, §3)",
    subscribers: ["AuditLog", "NotificationCenter"],
  },
  {
    eventType: "order.confirmed",
    description: "Заказ подтверждён администратором",
    subscribers: ["AuditLog"],
  },
  {
    eventType: "order.assembling_started",
    description: "Склад начал сборку",
    subscribers: ["AuditLog"],
  },
  {
    eventType: "order.ready_for_delivery",
    description: "Заказ готов к выдаче курьеру",
    subscribers: ["AuditLog"],
  },
  {
    eventType: "order.out_for_delivery",
    description: "Курьер выехал с заказом",
    subscribers: ["AuditLog"],
  },
  { eventType: "order.arrived", description: "Курьер прибыл к адресу", subscribers: ["AuditLog"] },
  { eventType: "order.delivered", description: "Заказ доставлен", subscribers: ["AuditLog"] },
  { eventType: "category.created", description: "Категория создана", subscribers: ["AuditLog"] },
  { eventType: "category.updated", description: "Категория обновлена", subscribers: ["AuditLog"] },
  { eventType: "stock.low", description: "Остаток товара ниже порога", subscribers: ["AuditLog"] },
  {
    eventType: "stock.depleted",
    description: "Остаток товара исчерпан",
    subscribers: ["AuditLog"],
  },
  {
    eventType: "stock.adjusted",
    description: "Ручная корректировка остатка складом",
    subscribers: ["AuditLog"],
  },
  {
    eventType: "courier.assigned",
    description: "Курьер назначен на заказ",
    subscribers: ["AuditLog"],
  },
  {
    eventType: "courier.status_changed",
    description: "Курьер изменил доступность",
    subscribers: ["AuditLog"],
  },
  {
    eventType: "customer.blocked",
    description: "Покупатель заблокирован",
    subscribers: ["AuditLog"],
  },
  {
    eventType: "customer.unblocked",
    description: "Покупатель разблокирован",
    subscribers: ["AuditLog"],
  },
  {
    eventType: "role.assigned",
    description: "Роль назначена пользователю",
    subscribers: ["AuditLog"],
  },
  {
    eventType: "role.revoked",
    description: "Роль отозвана у пользователя",
    subscribers: ["AuditLog"],
  },
  {
    eventType: "permission.changed",
    description: "Admin-scope (finance/marketing) назначен или отозван",
    subscribers: ["AuditLog"],
  },
  {
    eventType: "seller.registered",
    description: "Продавец зарегистрирован",
    subscribers: ["AuditLog"],
  },
  { eventType: "seller.verified", description: "Продавец проверен", subscribers: ["AuditLog"] },
  { eventType: "seller.rejected", description: "Продавец отклонён", subscribers: ["AuditLog"] },
  {
    eventType: "supply.requested",
    description: "Заявка поставщику создана",
    subscribers: ["AuditLog"],
  },
  {
    eventType: "supply.received",
    description: "Поставка принята на склад",
    subscribers: ["AuditLog"],
  },
  { eventType: "coupon.created", description: "Купон создан", subscribers: ["AuditLog"] },
  {
    eventType: "coupon.redeemed",
    description: "Купон применён к заказу",
    subscribers: ["AuditLog"],
  },
  {
    eventType: "payout.created",
    description: "Выплата продавцу рассчитана",
    subscribers: ["AuditLog"],
  },
  {
    eventType: "payout.completed",
    description: "Выплата продавцу завершена",
    subscribers: ["AuditLog"],
  },
  {
    eventType: "content.published",
    description: "Баннер создан или обновлён",
    subscribers: ["AuditLog"],
  },
  {
    eventType: "product.published",
    description: "Продавец опубликовал товар — запускает анализ качества карточки (ai.md, Этап 5)",
    subscribers: ["AuditLog", "AIOrchestrator"],
  },
  {
    eventType: "settings.changed",
    description: "Бизнес-настройка изменена",
    subscribers: ["AuditLog"],
  },
  {
    eventType: "product.media.analysis.requested",
    description: "Запрошен анализ фотографий товара",
    subscribers: ["AIOrchestrator"],
  },
  {
    eventType: "product.catalog.analysis.requested",
    description: "Запрошен анализ карточки товара",
    subscribers: ["AIOrchestrator"],
  },
  {
    eventType: "ai.job.completed",
    description: "ИИ-задача завершена (агрегированный результат)",
    subscribers: [],
  },
  {
    eventType: "photo.analysis.completed",
    description: "Анализ фото завершён — результат нигде не сохраняется (известный пробел, ai.md)",
    subscribers: [],
  },
  {
    eventType: "catalog.analysis.completed",
    description:
      "Анализ карточки завершён — результат нигде не сохраняется (известный пробел, ai.md)",
    subscribers: [],
  },
  {
    eventType: "delivery.zone.created",
    description: "Зона доставки создана (docs/delivery/delivery-events.md)",
    subscribers: ["AuditLog"],
  },
  {
    eventType: "delivery.zone.updated",
    description: "Зона доставки обновлена",
    subscribers: ["AuditLog"],
  },
  {
    eventType: "delivery.zone.deactivated",
    description: "Зона доставки деактивирована",
    subscribers: ["AuditLog"],
  },
  {
    eventType: "delivery.tariff.created",
    description: "Тариф доставки создан",
    subscribers: ["AuditLog"],
  },
  {
    eventType: "delivery.tariff.updated",
    description: "Тариф доставки обновлён",
    subscribers: ["AuditLog"],
  },
];

/** automation.md — read-only observability over the already-existing IMarketplaceEventBus wiring. */
export class AutomationOverviewService {
  getOverview(): AutomationOverviewDTO {
    return {
      events: EVENT_CATALOG,
      architectureNote:
        "Шина событий — in-memory, в рамках одного процесса, без персистентности и без внешнего брокера. " +
        "Событие обрабатывается подписчиками синхронно, в рамках того же запроса (automation.md).",
    };
  }
}
