export interface UpdateSystemSettingsDto {
  readonly actorId: string;
  readonly platformName?: string;
  readonly supportEmail?: string;
  readonly defaultLocale?: string;
  readonly defaultCurrency?: string;
}
