# Принцип 03: Dependency Rule

## Формулировка

Зависимости направлены **внутрь**: Domain зависит от портов,  
но **никогда** от конкретных адаптеров.

## Запрещено

```typescript
// ❌ Domain создаёт адаптер сам
class CatalogService {
  private shopify = new ShopifyCatalogAdapter();
}
```

## Разрешено

```typescript
// ✅ Domain получает порт через конструктор
class CatalogService {
  constructor(private readonly products: IProductRepository) {}
}
```

## Composition Root

Выбор реализации (`Shopify` vs `Supabase`) — **только** в `server/di/container.ts`.

## Ссылки

- [05-composition-root.md](./05-composition-root.md)
