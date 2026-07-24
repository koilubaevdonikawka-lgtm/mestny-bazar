# Принцип 04: DTO Contracts

## Формулировка

Frontend знает **только DTO** из `shared/contracts/`.  
Никаких типов БД, Shopify GraphQL или Finik payload в UI.

## Правила

| Слой | Типы |
|------|------|
| `shared/contracts/` | `ProductDTO`, `OrderDTO`, `PaymentMethod` |
| `server/adapters/` | Маппинг DB row → DTO |
| `src/` | Импорт только из `shared/contracts/` |

## Запрещено в контрактах

- Имена провайдеров (`finikPaymentUrl` → `paymentUrl`)
- Supabase `Database` types
- Shopify `ShopifyProduct`

## Маппинг

```
DB: finik_payment_url  →  Adapter  →  DTO: paymentUrl
```

## Ссылки

- [07-server-only-secrets.md](./07-server-only-secrets.md)
