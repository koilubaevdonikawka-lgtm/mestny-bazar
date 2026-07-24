export interface SetMaintenanceModeDto {
  readonly actorId: string;
  readonly enabled: boolean;
  readonly message?: string;
}
