# Onboarding Boundary — граница Customer Management

> **Статус:** архитектурное правило (Stage 89.1)  
> **Изменения REST API:** нет  
> **Изменения поведения:** нет

---

## Граница ответственности

| Область | Владелец | Начало |
|---------|----------|--------|
| Путь пользователя **до** регистрации | Experience Engine, будущий Onboarding Module | Первый запуск приложения |
| Управление покупателем **после** регистрации | Customer Management (Application Layer + Customer BCM) | `POST /api/customers/register` |

---

## До регистрации (не Customer Management)

Следующие элементы **не входят** в Customer Management:

- welcome-экраны и туры по приложению
- демонстрация ценности платформы
- мотивация к регистрации
- сезонные и праздничные оформления onboarding
- A/B-тесты первого экрана

Ими управляет **Experience Engine** и будущий **Onboarding Module** через конфигурацию, без изменения Customer BCM.

---

## После регистрации (Customer Management)

Customer Management начинается с момента создания учётной записи:

1. `RegisterCustomerUseCase` — регистрация
2. `VerifyPhoneUseCase` — подтверждение телефона
3. `CreateCustomerProfileUseCase` / `UpdateCustomerProfileUseCase` — профиль
4. Управление адресами, уведомлениями, историей заказов
5. `DeactivateCustomerUseCase` — деактивация

REST-маршруты Stage 89 остаются без изменений.

---

## Связанные документы

- [`ARCHITECTURE_POLICY.md`](./ARCHITECTURE_POLICY.md) — раздел 9 «Регистрация пользователя»
- [`../architecture.md`](../architecture.md) — техническая архитектура
