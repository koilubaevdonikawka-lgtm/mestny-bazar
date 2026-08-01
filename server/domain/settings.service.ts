import type { ISettingsRepository } from "@server/ports/settings.repository";
import type { PlatformSettingDTO, UpdateSettingRequest } from "@shared/contracts/settings";

/**
 * Stage 1 (infrastructure only): plain CRUD over ISettingsRepository. No
 * domain service reads a specific key from here yet — that migration of
 * individual hardcodes happens per-module in later Admin Platform stages
 * (see docs/admin-platform/settings.md, docs/admin-platform/IMPLEMENTATION_ORDER.md).
 * Access control (who may call this) is enforced by the caller
 * (server/functions/settings.executor.ts: requireAdminFromRequest() then
 * IPermissionPolicy) — this service assumes the actor is already authorized.
 */
export class SettingsService {
  constructor(private readonly settings: ISettingsRepository) {}

  async list(): Promise<PlatformSettingDTO[]> {
    return this.settings.list();
  }

  async get(key: string): Promise<PlatformSettingDTO | null> {
    return this.settings.get(key);
  }

  async update(userId: string, request: UpdateSettingRequest): Promise<PlatformSettingDTO> {
    return this.settings.set(request.key, request.value, request.category, userId);
  }
}
