export interface CreateDisputeDto {
  readonly initiatorId: string;
  readonly counterpartyId: string;
  readonly orderId?: string | null;
  readonly reason: string;
  readonly description: string;
}
