export const IntegrationStatus = {
  ACTIVE: "ACTIVE",
  STUB: "STUB",
  NOT_CONFIGURED: "NOT_CONFIGURED",
} as const;

export type IntegrationStatus = (typeof IntegrationStatus)[keyof typeof IntegrationStatus];

export interface IntegrationSummary {
  name: string;
  port: string;
  adapter: string;
  status: IntegrationStatus;
  /** null when the integration has no secret to configure (e.g. Supabase Storage). */
  secretConfigured: boolean | null;
}

export interface IntegrationsStatusDTO {
  integrations: IntegrationSummary[];
}
