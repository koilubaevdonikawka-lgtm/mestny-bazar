import type { Language } from "@/i18n/languages";

/**
 * Задача №200 — mirrors `AuditAction` in server/ports/audit-log.port.ts
 * (STEP 0: 65 literals, confirmed against that file directly). Duplicated
 * here rather than imported — `src/` doesn't depend on `server/` port types,
 * the same reason shared/contracts/audit-log.ts's own `action` field is
 * typed as plain `string` rather than the server union. `satisfies` below
 * makes a missing/extra key across the three language tables a build-time
 * error, so the two unions can't silently drift without a visible failure
 * here (though nothing enforces this file matches the server union itself —
 * keep them in sync by hand if the server union changes).
 */
export type AuditActionCode =
  | "order.created"
  | "order.cancelled"
  | "order.operational_cascade_started"
  | "order.confirmed"
  | "order.assembling_started"
  | "order.ready_for_delivery"
  | "order.out_for_delivery"
  | "order.arrived"
  | "order.cash_payment_received"
  | "order.delivered"
  | "order.paid"
  | "payment.initiated"
  | "payment.confirmed"
  | "payment.failed"
  | "payment.expired"
  | "category.created"
  | "category.updated"
  | "category.deleted"
  | "stock.low"
  | "stock.depleted"
  | "stock.received"
  | "stock.returned"
  | "stock.adjusted"
  | "courier.assigned"
  | "courier.status_changed"
  | "courier.created"
  | "courier.blocked"
  | "courier.unblocked"
  | "customer.blocked"
  | "customer.unblocked"
  | "customer.account_deleted"
  | "seller.registered"
  | "seller.verified"
  | "seller.rejected"
  | "supply.requested"
  | "supply.received"
  | "role.assigned"
  | "role.revoked"
  | "coupon.created"
  | "coupon.redeemed"
  | "payout.created"
  | "payout.completed"
  | "content.published"
  | "product.published"
  | "product.deleted"
  | "settings.changed"
  | "permission.changed"
  | "delivery.zone.created"
  | "delivery.zone.updated"
  | "delivery.zone.deactivated"
  | "delivery.store.created"
  | "delivery.store.updated"
  | "delivery.tariff.created"
  | "delivery.tariff.updated"
  | "ownership.transfer.initiated"
  | "ownership.transfer.accepted"
  | "ownership.transfer.completed"
  | "ownership.transfer.cancelled"
  | "rbac.role.created"
  | "rbac.role.updated"
  | "rbac.role.deleted"
  | "rbac.role.assigned"
  | "rbac.role.revoked"
  | "rbac.permission.created"
  | "rbac.permission.updated"
  | "rbac.permission.deleted";

/**
 * Mirrors the entityType string literals actually assigned in
 * server/domain/audit-log/marketplace-events.subscriber.ts (STEP 0: grepped
 * every `entityType: "..."` line in that file directly — 18 distinct
 * values). Not the server's own type (entityType is plain `string` there,
 * on purpose — see audit-log.port.ts's AuditRecord).
 */
export type AuditEntityTypeCode =
  | "order"
  | "category"
  | "product"
  | "courier"
  | "customer"
  | "seller"
  | "supply"
  | "user"
  | "coupon"
  | "payout"
  | "banner"
  | "setting"
  | "delivery_zone"
  | "store"
  | "delivery_tariff"
  | "ownership_transfer"
  | "rbac_role"
  | "rbac_permission";

const ACTION_LABELS_RU: Record<AuditActionCode, string> = {
  "order.created": "Заказ создан",
  "order.cancelled": "Заказ отменён",
  "order.operational_cascade_started": "Обработка заказа началась",
  "order.confirmed": "Заказ подтверждён",
  "order.assembling_started": "Сборка заказа начата",
  "order.ready_for_delivery": "Заказ готов к доставке",
  "order.out_for_delivery": "Курьер выехал с заказом",
  "order.arrived": "Курьер прибыл к клиенту",
  "order.cash_payment_received": "Наличная оплата получена",
  "order.delivered": "Заказ доставлен",
  "order.paid": "Заказ оплачен",
  "payment.initiated": "Оплата начата",
  "payment.confirmed": "Платёж подтверждён",
  "payment.failed": "Платёж не прошёл",
  "payment.expired": "Время на оплату истекло",
  "category.created": "Категория создана",
  "category.updated": "Категория изменена",
  "category.deleted": "Категория удалена",
  "stock.low": "Остаток товара заканчивается",
  "stock.depleted": "Товар закончился на складе",
  "stock.received": "Товар поступил на склад",
  "stock.returned": "Возврат товара на склад",
  "stock.adjusted": "Остаток товара скорректирован",
  "courier.assigned": "Курьер назначен",
  "courier.status_changed": "Курьер изменил статус доступности",
  "courier.created": "Курьер добавлен",
  "courier.blocked": "Курьер заблокирован",
  "courier.unblocked": "Курьер разблокирован",
  "customer.blocked": "Покупатель заблокирован",
  "customer.unblocked": "Покупатель разблокирован",
  "customer.account_deleted": "Покупатель удалил свой аккаунт",
  "seller.registered": "Продавец зарегистрировался",
  "seller.verified": "Продавец подтверждён",
  "seller.rejected": "Продавцу отказано",
  "supply.requested": "Поставка запрошена",
  "supply.received": "Поставка получена",
  "role.assigned": "Роль назначена",
  "role.revoked": "Роль отозвана",
  "coupon.created": "Купон создан",
  "coupon.redeemed": "Купон использован",
  "payout.created": "Выплата создана",
  "payout.completed": "Выплата выполнена",
  "content.published": "Баннер опубликован",
  "product.published": "Товар опубликован",
  "product.deleted": "Товар удалён",
  "settings.changed": "Настройка изменена",
  "permission.changed": "Права доступа изменены",
  "delivery.zone.created": "Зона доставки создана",
  "delivery.zone.updated": "Зона доставки изменена",
  "delivery.zone.deactivated": "Зона доставки отключена",
  "delivery.store.created": "Склад создан",
  "delivery.store.updated": "Склад изменён",
  "delivery.tariff.created": "Тариф доставки создан",
  "delivery.tariff.updated": "Тариф доставки изменён",
  "ownership.transfer.initiated": "Передача владения инициирована",
  "ownership.transfer.accepted": "Передача владения принята",
  "ownership.transfer.completed": "Передача владения завершена",
  "ownership.transfer.cancelled": "Передача владения отменена",
  "rbac.role.created": "Роль доступа создана",
  "rbac.role.updated": "Роль доступа изменена",
  "rbac.role.deleted": "Роль доступа удалена",
  "rbac.role.assigned": "Роль доступа назначена",
  "rbac.role.revoked": "Роль доступа отозвана",
  "rbac.permission.created": "Право доступа создано",
  "rbac.permission.updated": "Право доступа изменено",
  "rbac.permission.deleted": "Право доступа удалено",
};

const ACTION_LABELS_EN: Record<AuditActionCode, string> = {
  "order.created": "Order created",
  "order.cancelled": "Order cancelled",
  "order.operational_cascade_started": "Order processing started",
  "order.confirmed": "Order confirmed",
  "order.assembling_started": "Order assembly started",
  "order.ready_for_delivery": "Order ready for delivery",
  "order.out_for_delivery": "Courier picked up the order",
  "order.arrived": "Courier arrived at the customer",
  "order.cash_payment_received": "Cash payment received",
  "order.delivered": "Order delivered",
  "order.paid": "Order paid",
  "payment.initiated": "Payment started",
  "payment.confirmed": "Payment confirmed",
  "payment.failed": "Payment failed",
  "payment.expired": "Payment window expired",
  "category.created": "Category created",
  "category.updated": "Category updated",
  "category.deleted": "Category deleted",
  "stock.low": "Stock running low",
  "stock.depleted": "Stock depleted",
  "stock.received": "Stock received into the warehouse",
  "stock.returned": "Stock returned to the warehouse",
  "stock.adjusted": "Stock adjusted",
  "courier.assigned": "Courier assigned",
  "courier.status_changed": "Courier changed availability",
  "courier.created": "Courier added",
  "courier.blocked": "Courier blocked",
  "courier.unblocked": "Courier unblocked",
  "customer.blocked": "Customer blocked",
  "customer.unblocked": "Customer unblocked",
  "customer.account_deleted": "Customer deleted their account",
  "seller.registered": "Seller registered",
  "seller.verified": "Seller verified",
  "seller.rejected": "Seller rejected",
  "supply.requested": "Supply requested",
  "supply.received": "Supply received",
  "role.assigned": "Role assigned",
  "role.revoked": "Role revoked",
  "coupon.created": "Coupon created",
  "coupon.redeemed": "Coupon redeemed",
  "payout.created": "Payout created",
  "payout.completed": "Payout completed",
  "content.published": "Banner published",
  "product.published": "Product published",
  "product.deleted": "Product deleted",
  "settings.changed": "Setting changed",
  "permission.changed": "Permissions changed",
  "delivery.zone.created": "Delivery zone created",
  "delivery.zone.updated": "Delivery zone updated",
  "delivery.zone.deactivated": "Delivery zone deactivated",
  "delivery.store.created": "Warehouse created",
  "delivery.store.updated": "Warehouse updated",
  "delivery.tariff.created": "Delivery tariff created",
  "delivery.tariff.updated": "Delivery tariff updated",
  "ownership.transfer.initiated": "Ownership transfer initiated",
  "ownership.transfer.accepted": "Ownership transfer accepted",
  "ownership.transfer.completed": "Ownership transfer completed",
  "ownership.transfer.cancelled": "Ownership transfer cancelled",
  "rbac.role.created": "Access role created",
  "rbac.role.updated": "Access role updated",
  "rbac.role.deleted": "Access role deleted",
  "rbac.role.assigned": "Access role assigned",
  "rbac.role.revoked": "Access role revoked",
  "rbac.permission.created": "Permission created",
  "rbac.permission.updated": "Permission updated",
  "rbac.permission.deleted": "Permission deleted",
};

const ACTION_LABELS_KY: Record<AuditActionCode, string> = {
  "order.created": "Буйрутма түзүлдү",
  "order.cancelled": "Буйрутма жокко чыгарылды",
  "order.operational_cascade_started": "Буйрутманы иштетүү башталды",
  "order.confirmed": "Буйрутма ырасталды",
  "order.assembling_started": "Буйрутманы чогултуу башталды",
  "order.ready_for_delivery": "Буйрутма жеткирүүгө даяр",
  "order.out_for_delivery": "Курьер буйрутма менен чыкты",
  "order.arrived": "Курьер кардарга жетти",
  "order.cash_payment_received": "Накталай төлөм алынды",
  "order.delivered": "Буйрутма жеткирилди",
  "order.paid": "Буйрутма төлөндү",
  "payment.initiated": "Төлөм башталды",
  "payment.confirmed": "Төлөм ырасталды",
  "payment.failed": "Төлөм өтпөй калды",
  "payment.expired": "Төлөө убактысы бүттү",
  "category.created": "Категория түзүлдү",
  "category.updated": "Категория жаңыртылды",
  "category.deleted": "Категория өчүрүлдү",
  "stock.low": "Товардын калдыгы азайып баратат",
  "stock.depleted": "Товар складда түгөндү",
  "stock.received": "Товар складка түштү",
  "stock.returned": "Товар складка кайтарылды",
  "stock.adjusted": "Товардын калдыгы туураланды",
  "courier.assigned": "Курьер дайындалды",
  "courier.status_changed": "Курьер жеткиликтүүлүк статусун өзгөрттү",
  "courier.created": "Курьер кошулду",
  "courier.blocked": "Курьер бөгөттөлдү",
  "courier.unblocked": "Курьер бөгөттөн чыгарылды",
  "customer.blocked": "Сатып алуучу бөгөттөлдү",
  "customer.unblocked": "Сатып алуучу бөгөттөн чыгарылды",
  "customer.account_deleted": "Сатып алуучу өз аккаунтун өчүрдү",
  "seller.registered": "Сатуучу катталды",
  "seller.verified": "Сатуучу ырасталды",
  "seller.rejected": "Сатуучуга баш тартылды",
  "supply.requested": "Жеткирүү суралды",
  "supply.received": "Жеткирүү алынды",
  "role.assigned": "Роль дайындалды",
  "role.revoked": "Роль алынып салынды",
  "coupon.created": "Купон түзүлдү",
  "coupon.redeemed": "Купон колдонулду",
  "payout.created": "Төлөм түзүлдү",
  "payout.completed": "Төлөм аткарылды",
  "content.published": "Баннер жарыяланды",
  "product.published": "Товар жарыяланды",
  "product.deleted": "Товар өчүрүлдү",
  "settings.changed": "Жөндөө өзгөртүлдү",
  "permission.changed": "Мүмкүнчүлүктөр өзгөртүлдү",
  "delivery.zone.created": "Жеткирүү зонасы түзүлдү",
  "delivery.zone.updated": "Жеткирүү зонасы жаңыртылды",
  "delivery.zone.deactivated": "Жеткирүү зонасы активсиз кылынды",
  "delivery.store.created": "Склад түзүлдү",
  "delivery.store.updated": "Склад жаңыртылды",
  "delivery.tariff.created": "Жеткирүү тарифи түзүлдү",
  "delivery.tariff.updated": "Жеткирүү тарифи жаңыртылды",
  "ownership.transfer.initiated": "Ээликти өткөрүү башталды",
  "ownership.transfer.accepted": "Ээликти өткөрүү кабыл алынды",
  "ownership.transfer.completed": "Ээликти өткөрүү аяктады",
  "ownership.transfer.cancelled": "Ээликти өткөрүү жокко чыгарылды",
  "rbac.role.created": "Мүмкүнчүлүк ролу түзүлдү",
  "rbac.role.updated": "Мүмкүнчүлүк ролу жаңыртылды",
  "rbac.role.deleted": "Мүмкүнчүлүк ролу өчүрүлдү",
  "rbac.role.assigned": "Мүмкүнчүлүк ролу дайындалды",
  "rbac.role.revoked": "Мүмкүнчүлүк ролу алынып салынды",
  "rbac.permission.created": "Мүмкүнчүлүк түзүлдү",
  "rbac.permission.updated": "Мүмкүнчүлүк жаңыртылды",
  "rbac.permission.deleted": "Мүмкүнчүлүк өчүрүлдү",
};

const ENTITY_TYPE_LABELS_RU: Record<AuditEntityTypeCode, string> = {
  order: "Заказ",
  category: "Категория",
  product: "Товар",
  coupon: "Купон",
  courier: "Курьер",
  customer: "Покупатель",
  seller: "Продавец",
  supply: "Поставка",
  user: "Пользователь",
  payout: "Выплата",
  banner: "Баннер",
  delivery_zone: "Зона доставки",
  store: "Склад",
  delivery_tariff: "Тариф доставки",
  ownership_transfer: "Передача владения",
  rbac_role: "Роль доступа",
  rbac_permission: "Право доступа",
  setting: "Настройка",
};

const ENTITY_TYPE_LABELS_EN: Record<AuditEntityTypeCode, string> = {
  order: "Order",
  category: "Category",
  product: "Product",
  coupon: "Coupon",
  courier: "Courier",
  customer: "Customer",
  seller: "Seller",
  supply: "Supply",
  user: "User",
  payout: "Payout",
  banner: "Banner",
  delivery_zone: "Delivery zone",
  store: "Warehouse",
  delivery_tariff: "Delivery tariff",
  ownership_transfer: "Ownership transfer",
  rbac_role: "Access role",
  rbac_permission: "Permission",
  setting: "Setting",
};

const ENTITY_TYPE_LABELS_KY: Record<AuditEntityTypeCode, string> = {
  order: "Буйрутма",
  category: "Категория",
  product: "Товар",
  coupon: "Купон",
  courier: "Курьер",
  customer: "Сатып алуучу",
  seller: "Сатуучу",
  supply: "Жеткирүү",
  user: "Колдонуучу",
  payout: "Төлөм",
  banner: "Баннер",
  delivery_zone: "Жеткирүү зонасы",
  store: "Склад",
  delivery_tariff: "Жеткирүү тарифи",
  ownership_transfer: "Ээликти өткөрүү",
  rbac_role: "Мүмкүнчүлүк ролу",
  rbac_permission: "Мүмкүнчүлүк",
  setting: "Жөндөө",
};

/** Only ru/ky/en have their own table — every other supported Language falls back to en, same as LanguageProvider's own dictionaries map. */
const ACTION_LABELS: Partial<Record<Language, Record<AuditActionCode, string>>> = {
  ru: ACTION_LABELS_RU,
  en: ACTION_LABELS_EN,
  ky: ACTION_LABELS_KY,
};

const ENTITY_TYPE_LABELS: Partial<Record<Language, Record<AuditEntityTypeCode, string>>> = {
  ru: ENTITY_TYPE_LABELS_RU,
  en: ENTITY_TYPE_LABELS_EN,
  ky: ENTITY_TYPE_LABELS_KY,
};

function isAuditActionCode(value: string): value is AuditActionCode {
  return value in ACTION_LABELS_RU;
}

function isAuditEntityTypeCode(value: string): value is AuditEntityTypeCode {
  return value in ENTITY_TYPE_LABELS_RU;
}

/** Falls back to the raw technical code when `action` isn't a recognized AuditActionCode (e.g. a backend action added before its label lands here) — never blank, never the dictionary path. */
export function getAuditActionLabel(language: Language, action: string): string {
  if (!isAuditActionCode(action)) return action;
  const table = ACTION_LABELS[language] ?? ACTION_LABELS_EN;
  return table[action];
}

/** Same fallback contract as getAuditActionLabel, for entityType. */
export function getAuditEntityTypeLabel(language: Language, entityType: string): string {
  if (!isAuditEntityTypeCode(entityType)) return entityType;
  const table = ENTITY_TYPE_LABELS[language] ?? ENTITY_TYPE_LABELS_EN;
  return table[entityType];
}

export interface AuditLabelOption<T extends string> {
  value: T;
  label: string;
}

/** Alphabetical by localized label — a flat 65-item list has no other natural grouping for a non-searchable <Select>. */
export function listAuditActionOptions(language: Language): AuditLabelOption<AuditActionCode>[] {
  const table = ACTION_LABELS[language] ?? ACTION_LABELS_EN;
  return (Object.keys(table) as AuditActionCode[])
    .map((value) => ({ value, label: table[value] }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function listAuditEntityTypeOptions(
  language: Language,
): AuditLabelOption<AuditEntityTypeCode>[] {
  const table = ENTITY_TYPE_LABELS[language] ?? ENTITY_TYPE_LABELS_EN;
  return (Object.keys(table) as AuditEntityTypeCode[])
    .map((value) => ({ value, label: table[value] }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
