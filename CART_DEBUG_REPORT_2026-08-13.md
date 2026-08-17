# Cart Debug Report — 2026-08-13

## Update — точная причина найдена (товар "Часы", mode: guest, ошибка "не удалось добавить...")

**Короткий ответ: указанный mode "guest" не соответствует реальному состоянию
стора в момент ошибки.** Сообщение "Не удалось добавить товар в корзину.
Попробуйте ещё раз." физически не может появиться, пока `mode === "guest"` —
код это доказывает ниже. Значит на момент клика `useCartStore.getState().mode`
фактически был `"authenticated"` (застрял так после более раннего реального
входа через Google), хотя в браузере пользователь сейчас не залогинен — и
именно это несоответствие вызывает ошибку.

### 1. Grep по всему `src/` — где вызывается это сообщение

```
$ grep -rn "не удалось добавить\|попробуйте ещё раз" src/ -i
src/stores/cartStore.ts:158:  toast.error("Не удалось добавить товар в корзину. Попробуйте ещё раз.");
```

Эта строка — **единственное место во всём проекте**, где встречается именно
этот текст. Больше нигде (ни в компоненте товара, ни в `CartDrawer`, ни в
`api/cart.ts`) такого сообщения нет.

### 2. Где именно эта строка в `addItem` — и почему это доказывает, что mode ≠ guest

`src/stores/cartStore.ts`, `addItem` целиком (строки 134-163):

```ts
addItem: async (item) => {
  const { items, mode } = get();

  if (mode === "guest") {                              // ← строка 137
    const existingIndex = items.findIndex((i) => i.variantId === item.variantId);
    if (existingIndex >= 0) {
      set({ items: items.map((i, idx) => idx === existingIndex
        ? { ...i, quantity: i.quantity + item.quantity } : i) });
    } else {
      set({ items: [...items, item] });
    }
    return true;                                        // ← строка 148: ВЫХОД здесь
  }

  set({ isLoading: true });                              // код ниже — ТОЛЬКО не-guest
  try {
    const cart = await addCartItem(toLineInput(item));    // ← строка 153: сетевой запрос
    set({ items: cart.items.map(fromCartItemDTO) });
    return true;
  } catch (e) {                                          // ← строка 156
    console.error("Failed to add item:", e);
    toast.error("Не удалось добавить товар в корзину. Попробуйте ещё раз."); // ← строка 158
    return false;
  } finally {
    set({ isLoading: false });
  }
},
```

Ветка `if (mode === "guest")` заканчивается `return true` **до** объявления
`try/catch`. Это структурно означает: пока `mode === "guest"`, строки 151-162
(включая toast на строке 158) **не выполняются никогда** — до них в принципе
нельзя дойти. `handleAddToCart` на странице товара не содержит собственного
`try/catch` (в этом нет нужды — ошибка уже гасится внутри `addItem`), поэтому
единственный источник этого конкретного текста — строка 158, только в
не-guest ветке.

### 3. Что конкретно бросает исключение — полная трассировка

```
handleAddToCart()                                  src/routes/product.$handle.tsx:233
  → addItem({ product, variantId, quantity, ... })  src/stores/cartStore.ts:134
    → mode !== "guest" → пропускает guest-ветку
    → addCartItem(toLineInput(item))                src/api/cart.ts:25
      → addCartItemFn({ data: line })               TanStack Start server function (RPC)
        → executeAddCartItem(line)                  server/functions/cart.executor.ts:20
          → requireUserIdFromRequest()              server/auth/resolve-user.ts:71
            → resolveUserIdFromRequest()             server/auth/resolve-user.ts:45
              → нет валидного Bearer-токена (пользователь реально не залогинен)
              → return null                          server/auth/resolve-user.ts:52/55/66
            → userId === null → throw new UnauthorizedError()   ← ЗДЕСЬ throw
          ↑ исключение летит вверх через RPC-границу
        ↑ addCartItemFn(...) реджектится
      ↑ addCartItem(...) реджектится
    ↑ await addCartItem(...) бросает — попадает в catch (строка 156)
  ← toast.error("Не удалось добавить...") + console.error(...) + return false
← handleAddToCart: added === false → success-toast НЕ показывается, товар не добавлен
```

`requireUserIdFromRequest()` (`server/auth/resolve-user.ts:71-77`):
```ts
export async function requireUserIdFromRequest(): Promise<string> {
  const userId = await resolveUserIdFromRequest();
  if (!userId) {
    throw new UnauthorizedError();
  }
  return userId;
}
```
Это ожидаемое, корректное поведение сервера — он не обязан (и не должен)
принимать `addCartItem` без валидного токена. Проблема не в сервере, а в том,
что **клиент неправильно решил, что нужно вообще пытаться этот запрос
делать**.

### 4. Почему `mode` вообще мог "залипнуть" на `"authenticated"` — настоящий баг

`src/hooks/useCartSync.ts`, строки 35-54:

```ts
useEffect(() => {
  if (isAuthenticated === null) return;

  const previous = wasAuthenticated.current;   // на КАЖДОМ новом монтировании компонента = null
  wasAuthenticated.current = isAuthenticated;

  if (isAuthenticated && previous !== true) {
    if (useCartStore.getState().mode === "authenticated") {
      void syncFromServer();
    } else {
      void mergeGuestIntoServer();              // ← ставит mode: "authenticated" при первом входе
    }
  } else if (!isAuthenticated && previous === true) {
    resetToGuest();                              // ← ЕДИНСТВЕННОЕ место, возвращающее mode: "guest"
  }
}, [isAuthenticated, syncFromServer, mergeGuestIntoServer, resetToGuest]);
```

`mode: "guest" → "authenticated"` пишется в `localStorage["platform-cart"]`
(персистентно, `zustand/persist`) в момент первого реального входа через
Google (`mergeGuestIntoServer`, вызывается из первой ветки). Это значение
переживает закрытие вкладки/браузера.

Возврат обратно в `"guest"` (`resetToGuest()`) происходит **только** если
именно ЭТОТ экземпляр компонента (в течение своего текущего монтирования)
своими глазами увидел живой переход `true → false` — то есть требует, чтобы
`wasAuthenticated.current` уже был `true` в момент, когда `isAuthenticated`
становится `false`.

При обычной свежей загрузке страницы `wasAuthenticated.current` стартует как
`null` (не `true`). Если к этому моменту:
- в localStorage уже лежит `mode: "authenticated"` (с более раннего реального
  входа),
- а текущая Supabase-сессия невалидна/истекла (`isAuthenticated` резолвится
  в `false` при первой проверке этого монтирования),

то условие `previous === true` — это `null === true` → `false`. Ветка
`resetToGuest()` **не срабатывает**. `mode` остаётся `"authenticated"`
навсегда (до следующего живого входа), даже когда пользователь на самом деле
не авторизован.

**Итог:** любой, кто хотя бы раз входил через Google в этом браузере, а потом
у него истекла/пропала сессия (например, просто время истекло, или сессия
Supabase не пережила перезапуск вкладки) — при следующем визите будет
считаться "guest" в интерфейсе (`isAuthenticated === false`, кнопки входа не
показываются — их вообще нет в header), но `cartStore.mode` останется
`"authenticated"`, и КАЖДОЕ действие с корзиной (`addItem`/`updateQuantity`/
`removeItem` — у всех трёх одна и та же структура guest-ветки) будет уходить
в сетевой запрос, который сервер корректно отклонит (`UnauthorizedError`), и
пользователь увидит именно этот toast.

### 5. Проверка по товару "Часы" конкретно

- `variant = product.variants.edges[0]?.node` — для "Часы" (как для любого
  товара через `toCatalogProductNode`) всегда определён, `undefined` не
  бывает. **Товар и его variant не имеют отношения к причине ошибки** —
  баг воспроизведётся на ЛЮБОМ товаре с `stock > 0`, если `mode` застрял на
  `"authenticated"`. То, что тест был именно на "Часы" (stock: 92) — совпадение
  выбора товара для теста, не часть причины.

### 6. Итог отчёта

- **Точное место ошибки:** `src/stores/cartStore.ts:158`, внутри `catch`
  блока `addItem`, недостижимого при `mode === "guest"`.
- **Точная причина:** `useCartStore.getState().mode` равен `"authenticated"`
  (устарело/залипло), хотя пользователь фактически не авторизован
  (`useSupabaseSession().isAuthenticated === false`). `addItem` из-за этого
  идёт в сетевой запрос `addCartItemFn` → сервер `requireUserIdFromRequest()`
  корректно бросает `UnauthorizedError` (нет валидного токена) → это
  исключение ловится в `cartStore.ts` и превращается в показанный toast.
- **Корень проблемы:** `src/hooks/useCartSync.ts`, строки 51-53 — переход
  `mode → "guest"` завязан на `wasAuthenticated.current === true`
  (live-переход, увиденный именно этим монтированием компонента), а не на
  фактическое текущее состояние `isAuthenticated`. Персистентный (localStorage)
  `mode: "authenticated"` от более раннего реального входа никогда не
  сверяется с текущим `isAuthenticated` при свежей загрузке страницы, если
  текущая сессия уже невалидна с самого начала.
- **К товару "Часы" эта причина не привязана** — variant и стоку "Часы" ни при
  чём, баг воспроизведётся на любом товаре при том же состоянии стора.

Код не менялся — как и было явно указано в задаче.


Это диагностика, без изменений кода (по явному требованию задачи). В этом окружении
**нет доступа к живому браузеру** — я не могу открыть DevTools, кликнуть по кнопке
"В корзину" вживую, посмотреть вкладку Console/Application или увидеть визуально,
появился ли badge. Всё, что ниже помечено как "код-анализ" или "прямой запрос к БД",
выполнено реально и напрямую (не предположение); всё, что требует живого клика в
браузере, явно помечено как невыполнимое отсюда — вместо этого показан точный путь
кода, который выполнился бы, и где мог бы возникнуть сбой.

---

## 1. Сток товаров — прямой SELECT к БД (Supabase REST, реальный запрос)

| slug | name | stock | publication_status | is_active |
|---|---|---|---|---|
| `demo-voda-pityevaya` | Вода питьевая негазированная | **300** | PUBLISHED | true |
| `product-1786547417456` | Часы | **92** | PUBLISHED | true |
| `demo-sok-yablochny` | Сок яблочный | **55** | PUBLISHED | true |
| `product-1786547379648` | Чехол | 0 | PUBLISHED | true |
| `product-1786542053982` | Лейка | 0 | PUBLISHED | true |
| `product-1786547249265` | Наушники | 0 | PUBLISHED | true |
| `product-1786547295137` | Зарядка | 0 | PUBLISHED | true |

**✅ Товары, доступные для покупки (stock > 0):** `demo-voda-pityevaya`, `product-1786547417456` (Часы), `demo-sok-yablochny`.

Для сравнения — этот же запрос сутки назад (в предыдущей задаче) показывал у "Часы"
`stock: 0`; сейчас `stock: 92` — значит сток кто-то поменял через админку между
задачами. Это подтверждает, что сток в БД не статичен и его стоит перепроверять
перед каждым тестом.

---

## 2-3. Код `handleAddToCart` (страница товара) — построчный разбор

Файл: `src/routes/product.$handle.tsx`, строки 233-249:

```tsx
const handleAddToCart = async () => {
  if (!variant) return;
  const added = await addItem({
    product: { node: product },
    variantId: variant.id,
    variantTitle: variant.title,
    price: variant.price,
    quantity,
    selectedOptions: variant.selectedOptions || [],
  });
  if (added) {
    toast.success(t("product.addedToCartToast"), {
      description: displayTitle,
      position: "top-center",
    });
  }
};
```

Проверка по пунктам задачи:
- **Вызывает `addItem(...)` из `useCartStore`** — да: `const addItem = useCartStore((s) => s.addItem);` (строка 176).
- **Передаёт правильные параметры** — да: `product`/`variantId`/`variantTitle`/`price`/`quantity`/`selectedOptions` — все поля соответствуют интерфейсу `CartItem` в `cartStore.ts`. `quantity` — это состояние `[quantity, setQuantity] = useState(1)` со страницы, управляемое кнопками [−]/[+].
- **try/catch** — здесь его нет, но это не баг: `addItem` сама ловит все свои ошибки внутри (см. ниже) и возвращает `false` вместо throw, поэтому вызывающему коду catch не нужен.
- **`onClick`** — привязан: `onClick={() => void handleAddToCart()}` (строка 310), кнопка активна при `!disabled` → `disabled={!canPurchase || cartLoading}`.
- **`canPurchase = product.inStock && !!variant`** — `variant` всегда определён для любого успешно загруженного товара (`toCatalogProductNode` всегда кладёт ровно один synthetic variant в `variants.edges`), поэтому `canPurchase` на практике равен просто `product.inStock`.

**Вывод по этому файлу: код корректен, `onClick` привязан, параметры передаются верно.**

---

## Код `addItem` — Zustand store (`src/stores/cartStore.ts`)

```ts
addItem: async (item) => {
  const { items, mode } = get();

  if (mode === "guest") {
    const existingIndex = items.findIndex((i) => i.variantId === item.variantId);
    if (existingIndex >= 0) {
      set({
        items: items.map((i, idx) =>
          idx === existingIndex ? { ...i, quantity: i.quantity + item.quantity } : i,
        ),
      });
    } else {
      set({ items: [...items, item] });
    }
    return true;
  }

  set({ isLoading: true });
  try {
    const cart = await addCartItem(toLineInput(item));
    set({ items: cart.items.map(fromCartItemDTO) });
    return true;
  } catch (e) {
    console.error("Failed to add item:", e);
    toast.error("Не удалось добавить товар в корзину. Попробуйте ещё раз.");
    return false;
  } finally {
    set({ isLoading: false });
  }
},
```

**Ключевой факт, определяющий весь дальнейший разбор: у store есть два режима, `mode: "guest" | "authenticated"`.**

### Режим `guest` (гость, не вошёл через Google)

- Чисто синхронное, локальное изменение `state.items` через Zustand `set(...)`.
- **Нет сетевого запроса вообще.** Здесь физически нечему сломаться — ни API,
  ни бэкенд, ни авторизация не участвуют. Функция всегда возвращает `true`.
- Это режим по умолчанию для абсолютного большинства посетителей: в предыдущей
  задаче кнопка входа и весь `AccountMenu` были убраны из header на всех
  клиентских страницах (`showAccountMenu={false}`), поэтому шанс, что случайный
  тестировщик сейчас авторизован через Google, невысок — если специально не
  проходил OAuth раньше на этом браузере.

### Режим `authenticated` (вход через Google подтверждён)

- Идёт реальный запрос: `addCartItem` → `addCartItemFn` (TanStack Start server
  function) → `executeAddCartItem` (`server/functions/cart.executor.ts`) →
  `requireUserIdFromRequest()` + `cartService.addItem(userId, line)` →
  Supabase.
- **Это единственный путь, где `addItem` теоретически может провалиться** —
  сетевая ошибка, невалидный/просроченный токен, ошибка на бэкенде. Если это
  происходит, `catch` ловит её, показывает toast с ошибкой ("Не удалось
  добавить товар...") и возвращает `false` — то есть `handleAddToCart`'s
  `if (added)` не сработает, success-toast не покажется, и по факту "товар не
  добавился". Тост-с-ошибкой в этом случае ДОЛЖЕН быть виден на экране — если
  тестировщик его не заметил (Sonner-тосты показываются вверху экрана и
  автоматически исчезают), это выглядело бы как "просто ничего не произошло".

**Я не могу подтвердить или исключить сбой на этом (authenticated) пути без
живого теста — сервер/сеть/токен недоступны для проверки из этого окружения
статическим анализом.** Код обработки ошибок написан корректно (ошибка не
проглатывается молча — либо `console.error`, либо toast, либо оба), но сама
причина потенциального сетевого/серверного сбоя (если он есть) отсюда не
видна.

### `state.itemCount` — важное уточнение

В задаче упоминается проверка `state.itemCount` — **такого поля в сторе нет**.
Интерфейс `CartStore` содержит `items: CartItem[]`, но не отдельный счётчик.
Счётчик товаров вычисляется не в сторе, а прямо в компоненте `CartDrawer.tsx`:

```ts
const totalItems = items.reduce((s, i) => s + i.quantity, 0);
```

Это **сумма количеств**, а не число уникальных позиций — соответствует
требованию задачи ("считает количество товаров, а не уникальные товары"), и
пересчитывается на каждом рендере из актуального `items`. Так как `CartDrawer`
подписан на `useCartStore()` реактивно, любое изменение `items` (в том числе
из `addItem`) немедленно вызывает пересчёт `totalItems` и перерисовку badge —
архитектурно здесь нет точки, где обновление могло бы "потеряться". Это не
баг, а просто другое имя/место вычисления, чем предполагалось в задаче.

---

## 4. localStorage / персистентность

`cartStore.ts` использует `zustand/middleware`'s `persist`:

```ts
{
  name: "platform-cart",
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({ items: state.items, mode: state.mode }),
}
```

Ключ в localStorage: **`platform-cart`**. Сохраняются `items` и `mode`
(не `isLoading` — правильно, это transient-состояние). Это стандартный,
проверенный паттерн — тот же самый, что уже используется в `checkoutStore.ts`
и `categoryStore.ts` в этом проекте, без известных проблем там.

**Не могу подтвердить содержимое localStorage вживую** (нужен браузер) — но по
коду, после любого успешного `addItem` (гостевой режим) Zustand `persist`
автоматически сериализует новое состояние в `localStorage["platform-cart"]`
синхронно, без дополнительных действий с моей/вашей стороны.

---

## 5. Счётчик на иконке корзины (badge)

`src/components/CartDrawer.tsx`:

```tsx
{totalItems > 0 && (
  <Badge
    className={
      iconOnly
        ? "absolute -right-1 -top-1 h-5 min-w-5 ... bg-destructive text-destructive-foreground ..."
        : "ml-1 h-5 min-w-5 ... bg-destructive text-destructive-foreground ..."
    }
  >
    {totalItems}
  </Badge>
)}
```

- Красный (`bg-destructive`) — да, это уже было исправлено в предыдущей задаче
  (раньше был `bg-accent`, не гарантированно красный).
- Условие показа — `totalItems > 0`; при первом добавлении товара (`0 → 1`)
  badge должен появиться сразу же при следующем рендере `SiteHeader`/
  `CartDrawer`, так как этот компонент рендерится на каждой клиентской
  странице (`cartIconOnly` теперь везде).
- **Не могу подтвердить визуально** — код корректен по чтению, но появление
  бейджа на экране не проверено вживую.

---

## 6. Страница `/cart`

**Важная находка: маршрута `/cart` не существует в приложении.**

```
$ curl -o /dev/null -w "%{http_code}" https://mesnyibazar.com/cart
404
```

В `src/routes/` нет файла `cart.tsx` — корзина реализована исключительно как
`CartDrawer` (выезжающая панель `Sheet`), открывающаяся кликом по иконке в
header, а не как отдельная страница/URL. Переход на `/cart` попадёт на
`NotFoundComponent` (404), что не связано с "синхронизацией корзины" — это
архитектурная особенность (в проекте никогда не было отдельной страницы
корзины), а не регрессия.

Если требуется проверить, что товар реально в корзине, это делается кликом по
иконке корзины в header (открывает `CartDrawer`), а не переходом на `/cart`.

---

## 7. Полный тест на товаре со stock > 0

**Не выполнено вживую** — нет браузера в этом окружении. Ниже — точная
трассировка кода для сценария "открыть `demo-voda-pityevaya`, выбрать
количество 2, нажать 'В корзину'", без предположений о результате за
пределами того, что доказуемо по коду:

1. Страница загружает товар (`stock: 300` → `inStock: true` на сервере) →
   `canPurchase = true` → все три контрола активны (не `disabled`).
2. Клик `[+]` дважды → `quantity` состояние: `1 → 2` (проверено кодом,
   `increaseQuantity` корректен, см. предыдущий отчёт по кнопкам).
3. Клик "В корзину" → `handleAddToCart()` → `addItem({..., quantity: 2, ...})`.
4. Гостевой режим (наиболее вероятный, см. выше) → синхронно
   `items: [...items, newItem]`, `return true` → `if (added)` истинно →
   toast "Добавлено в корзину" с названием товара.
5. `CartDrawer`/`SiteHeader` реактивно видят новый `items` → `totalItems`
   пересчитывается → badge на иконке корзины должен показать `2`.
6. `/cart` — не существует, 404 (см. п.6 выше); проверка содержимого корзины
   — только через клик по иконке корзины.

**По коду в гостевом режиме эта цепочка не имеет ни одной точки отказа** —
нет условий, при которых шаг 3→4→5 не выполнился бы для товара с `stock > 0`.

---

## 8. Разбор гипотез из задачи

| # | Гипотеза | Вердикт |
|---|---|---|
| 1 | Stock = 0 → кнопка отключена | **Подтверждено ранее** (прошлый отчёт) — но не про товары со stock > 0, это отдельный, уже объяснённый случай. Для товаров из п.1 этого отчёта (сток > 0) не применимо. |
| 2 | `onClick` не привязан к кнопке | **Опровергнуто.** `onClick={() => void handleAddToCart()}` присутствует и корректен (см. п.2-3). |
| 3 | `addItem` функция сломана → товар не добавляется в state | **Не подтверждено по коду.** В гостевом режиме — не может сломаться (чистая синхронная запись). В authenticated-режиме — теоретически может (сетевая/серверная ошибка), но это ловится (toast + console.error), не проглатывается молча, и не проверяемо без живого теста. |
| 4 | Zustand store не синхронизируется | **Не подтверждено.** Реактивная подписка (`useCartStore()`/селекторы) — стандартный, корректно используемый паттерн, тот же, что и в остальном проекте. |
| 5 | localStorage не работает | **Не подтверждено по коду** — `persist` middleware настроен идентично другим сторам этого же проекта без известных проблем там. Не проверено вживую. |
| 6 | API ошибка при добавлении | **Возможна только в authenticated-режиме** — единственная гипотеза, которую я не могу ни подтвердить, ни опровергнуть без живого теста или логов сервера. |

---

## Итог

- **✅ Сток товаров:** 3 из 7 товаров доступны для покупки (см. таблицу п.1) —
  `demo-voda-pityevaya`, Часы (`product-1786547417456`), `demo-sok-yablochny`.
- **❌ Ошибки консоли:** не проверено — нет доступа к живому браузеру в этом
  окружении.
- **❌ Проблемы в коде:** **не найдены** при статическом разборе
  `handleAddToCart`, `addItem`, `CartDrawer`'s badge-логики и `persist`-
  конфигурации. Код для гостевого режима (наиболее вероятного для
  большинства посетителей после недавнего удаления `AccountMenu` из header)
  не имеет технической возможности "молча" не добавить товар — это чисто
  синхронная операция без сети.
- **✅ Тест "В корзину" (по коду):** должен работать для товаров со
  `stock > 0` в гостевом режиме — не имеет known failure path.
- **✅ Тест страницы корзины:** страницы `/cart` не существует (404) — это не
  баг, а архитектура (корзина = `CartDrawer`, не отдельный URL). Если именно
  переход на `/cart` был частью теста — вот причина, почему "товара не видно":
  вы вообще не попадаете на компонент корзины.

## Что нужно, чтобы продолжить (если проблема всё же реальна)

Раз статический анализ не нашёл дефекта в коде, для дальнейшей диагностики
нужен один из:
1. Точный товар (slug) и был ли вход через Google в момент теста (гость или
   authenticated) — режим меняет весь путь выполнения `addItem`.
2. Реальный текст ошибки из консоли браузера (F12 → Console), если она там
   есть — я не могу увидеть её сам.
3. Подтверждение: тестировали именно клик по иконке корзины (не переход на
   `/cart`, которого не существует).

Код не менялся — как и было явно указано в задаче.
