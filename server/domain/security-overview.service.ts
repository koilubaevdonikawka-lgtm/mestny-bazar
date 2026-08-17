import { SecurityItemStatus } from "@shared/contracts/security";
import type { SecurityOverviewDTO } from "@shared/contracts/security";

/**
 * security.md — a static summary of the platform's already-existing security
 * posture (RLS, service_role boundary, JWT role checks, import boundaries).
 * These are architectural facts, not live/queryable state — there is no
 * runtime signal that changes them, so this service does not depend on any
 * port. Live, changeable state (rate limiting, active sessions, access
 * attempt log) is explicitly listed under "gaps", matching security.md's own
 * "Обнаруженные пробелы" table rather than fabricating data for it.
 */
export class SecurityOverviewService {
  getOverview(): SecurityOverviewDTO {
    return {
      perimeter: [
        {
          name: "Аутентификация",
          mechanism: "Supabase Auth (JWT), Google OAuth",
          status: SecurityItemStatus.IMPLEMENTED,
        },
        {
          name: "Проверка роли",
          mechanism:
            "require<Role>FromRequest() — роль читается из user_roles, никогда из тела запроса",
          status: SecurityItemStatus.IMPLEMENTED,
        },
        {
          name: "Row Level Security",
          mechanism: "auth.uid() = owner_column на каждой таблице с персональными данными",
          status: SecurityItemStatus.IMPLEMENTED,
        },
        {
          name: "Обход RLS",
          mechanism: "service_role ключ — используется только на сервере, никогда в браузере",
          status: SecurityItemStatus.IMPLEMENTED,
        },
        {
          name: "Таймаут внешних вызовов auth",
          mechanism: "JWKS-запрос ограничен 5 секундами (AUTH_FETCH_TIMEOUT_MS)",
          status: SecurityItemStatus.IMPLEMENTED,
        },
        {
          name: "Границы импортов",
          mechanism:
            "ESLint no-restricted-imports — фронтенд не импортирует Supabase SDK/server напрямую",
          status: SecurityItemStatus.IMPLEMENTED,
        },
      ],
      gaps: [
        {
          name: "Rate limiting",
          note: "Не реализован — требует инфраструктуры уровня Cloudflare Rate Limiting Rules/KV",
        },
        {
          name: "APM/трекинг ошибок",
          note: "Точка интеграции готова (shared/observability/logger.ts), внешний сервис не подключён",
        },
        {
          name: "Журнал попыток доступа",
          note: "Аудит есть только для бизнес-событий — отказы проверки роли отдельно не журналируются",
        },
        {
          name: "Активные сессии",
          note: "Просмотр и принудительный разлогин не реализованы",
        },
      ],
    };
  }
}
