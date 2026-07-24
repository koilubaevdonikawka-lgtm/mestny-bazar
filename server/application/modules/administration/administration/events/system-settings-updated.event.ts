import type { SystemSettings } from "@server/application/modules/administration/administration/models";

export interface SystemSettingsUpdatedEvent {
  readonly type: "administration.system_settings.updated";
  readonly settings: SystemSettings;
  readonly occurredAt: string;
}

export function createSystemSettingsUpdatedEvent(
  settings: SystemSettings,
): SystemSettingsUpdatedEvent {
  return Object.freeze({
    type: "administration.system_settings.updated",
    settings,
    occurredAt: new Date().toISOString(),
  });
}
