import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/LanguageProvider";
import { CONTACT } from "@/config/contact";
import { BRAND } from "@/config/brand";

/**
 * Required by Google Play / App Store publication forms (a public,
 * no-login-required URL to link there). No auth guard: must be reachable by
 * anyone, including store reviewers.
 *
 * Задача №286 — the body below is a direct description of what this
 * codebase actually does, verified against the code (checkout/address
 * schemas, profiles/addresses/orders/device_tokens tables, Google-only
 * auth, finik.adapter.ts's real request body, TwoGisMapPicker +
 * reverseGeocode.ts, FCM push, GoogleAiAdapter). The previous version
 * claimed no geolocation and no push notifications, both of which exist.
 * Russian only for now — translations are a separate task, which is why the
 * body is a static constant and not i18n keys (the old body keys were
 * removed from every dictionary; only `privacy.title`/`privacy.linkLabel`
 * remain). When a real behavior below changes, update this text and
 * LAST_UPDATED together.
 */
export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [{ title: `${BRAND.name}` }],
  }),
});

const LAST_UPDATED = "20 сентября 2026 г.";

interface PolicySection {
  heading: string;
  paragraphs?: string[];
  items?: string[];
}

const SECTIONS: PolicySection[] = [
  {
    heading: "1. О чём этот документ",
    paragraphs: [
      "AIKUR — сервис доставки продуктов: сайт mesnyibazar.com и мобильное приложение, которое открывает тот же сайт. Здесь описано, какие данные покупателей мы собираем, зачем, кто их обрабатывает и как вы можете запросить их удаление.",
    ],
  },
  {
    heading: "2. Какие данные мы собираем и зачем",
    items: [
      "Вход в аккаунт. Вход возможен только через Google. Мы получаем и сохраняем имя и адрес электронной почты вашего Google-аккаунта. Пароль от Google нам не передаётся. Данные нужны, чтобы узнавать вас и показывать вашу историю заказов.",
      "Профиль. Имя и номер телефона, которые вы указываете сами на странице профиля. Нужны, чтобы не вводить их заново при каждом заказе.",
      "Оформление заказа. Имя, номер телефона, адрес доставки, необязательный комментарий к заказу, способ оплаты, а также состав, сумма и статус заказа. Нужны, чтобы собрать и доставить заказ и связаться с вами. Заказ можно оформить и без входа в аккаунт — тогда он не привязывается к аккаунту.",
      "Сохранённые адреса. Адрес, город и район, название и примечание к адресу и, если вы выбирали точку на карте, её координаты. Хранятся, чтобы вы могли быстро выбрать адрес при следующем заказе. Вы можете изменить или удалить их на странице профиля.",
      "Местоположение. Когда вы открываете карту для выбора точки доставки, сайт или приложение запрашивает у вашего устройства разрешение на определение местоположения. Если вы разрешили, карта центрируется на вашей позиции; вы можете передвинуть точку. Сохраняются координаты выбранной вами точки доставки. Мы не отслеживаем ваше местоположение в фоне и не запрашиваем его вне выбора точки доставки. Если вы отказали, карту можно использовать вручную.",
      "Push-уведомления (только в приложении). Если вы нажмёте кнопку включения уведомлений на странице «Информация» и разрешите их, мы сохраняем токен вашего устройства (выдаётся Firebase Cloud Messaging), тип платформы и связываем их с вашим аккаунтом. Через него мы отправляем уведомления о статусе ваших заказов (подтверждён, курьер готовится к доставке, курьер везёт заказ, доставлен, отменён), а также иногда информационные рассылки от администрации магазина.",
      "Данные в вашем браузере (localStorage). Сессия входа, содержимое корзины, выбранный язык и отметка о том, что приветственный экран уже показан. Это нужно для работы сайта. Рекламных и аналитических трекеров (например, Google Analytics или Яндекс.Метрики) на сайте нет.",
    ],
  },
  {
    heading: "3. Кто обрабатывает ваши данные",
    items: [
      "Supabase — база данных (профили, заказы, адреса, токены push), аутентификация и хранилище изображений товаров.",
      "Cloudflare (Workers) — хостинг и серверная часть сайта: через неё проходят все запросы к сервису.",
      "Google — вход через Google OAuth; Firebase Cloud Messaging — доставка push-уведомлений на устройство; Google Fonts — шрифты сайта загружаются с серверов Google, поэтому Google получает технические данные запроса, включая IP-адрес.",
      "Finik (AversPay, averspay.kg) — приём онлайн-платежей. Ему передаются только сумма заказа, идентификатор платежа, идентификатор магазина, название сервиса и адрес для уведомления об оплате. Ваши имя, телефон и адрес доставки в Finik не отправляются. Данные банковской карты сайт не запрашивает и не хранит.",
      "2GIS — карта выбора точки доставки. Скрипт и данные карты загружаются с серверов 2GIS напрямую в ваш браузер, поэтому 2GIS получает технические данные запросов, включая IP-адрес и запрашиваемую область карты.",
      "OpenStreetMap (Nominatim) — чтобы подставить текст адреса, ваш браузер отправляет в этот сервис координаты выбранной на карте точки.",
      "Google Gemini — используется только для обработки фотографий товаров и перевода названий и описаний каталога и зон доставки. Данные покупателей (имя, телефон, адрес, содержимое заказов) туда не передаются.",
      "Telegram — служебный бот используется только администраторами магазина для управления каталогом. Данные покупателей через него не передаются.",
      "Сотрудники магазина (администраторы, сборщики заказов, курьеры) видят имя, телефон, адрес доставки, комментарий и состав заказа — это нужно, чтобы собрать и доставить заказ.",
    ],
  },
  {
    heading: "4. Передача третьим лицам",
    paragraphs: [
      "Мы не продаём ваши данные. Они передаются только перечисленным выше сервисам и только в объёме, необходимом для работы сайта и приложения.",
    ],
  },
  {
    heading: "5. Хранение данных",
    paragraphs: [
      "История ваших заказов (состав, сумма, статус, способ оплаты, адрес и контактные данные, указанные в заказе) хранится в базе данных. Автоматического удаления данных по истечении срока хранения не предусмотрено: данные хранятся, пока они нужны для работы сервиса или пока вы не запросите их удаление.",
    ],
  },
  {
    heading: "6. Как управлять своими данными и запросить удаление",
    items: [
      "Изменить имя и телефон и удалить сохранённые адреса можно на странице профиля.",
      "Отозвать разрешение на определение местоположения и отключить push-уведомления можно в настройках вашего устройства или браузера.",
      "Чтобы запросить удаление аккаунта и связанных с ним данных, напишите нам на адрес электронной почты ниже с адреса, который использовался для входа, и укажите, что вы просите удалить данные. Мы рассмотрим запрос и сообщим о результате ответным письмом.",
    ],
  },
  {
    heading: "7. Изменения",
    paragraphs: [
      "Актуальная версия документа всегда доступна на этой странице, дата последнего обновления указана вверху. Если мы начнём собирать новые данные или изменим то, как используем существующие, мы обновим эту страницу.",
    ],
  },
];

function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader safeAreaTop showAccountMenu={false} showCart={false} showSignInFallback />
      <main className="flex-1 mx-auto max-w-2xl w-full px-4 py-8 sm:px-6">
        <Button asChild variant="ghost" className="-ml-2 rounded-full">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common.back")}
          </Link>
        </Button>

        <h1 className="mt-2 font-serif text-3xl tracking-tight">{t("privacy.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground" lang="ru">
          Последнее обновление: {LAST_UPDATED}
        </p>

        <div lang="ru" className="mt-6 space-y-6 text-sm leading-relaxed text-foreground">
          {SECTIONS.map((section) => (
            <section key={section.heading} className="space-y-2">
              <h2 className="font-serif text-xl tracking-tight">{section.heading}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.items && (
                <ul className="list-disc space-y-2 pl-5">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <section className="space-y-2">
            <h2 className="font-serif text-xl tracking-tight">8. Контакты</h2>
            <p>
              По вопросам обработки персональных данных и для запроса на удаление данных пишите:{" "}
              <a href={`mailto:${CONTACT.email}`} className="text-primary hover:underline">
                {CONTACT.email}
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
