export interface CreateTicketDto {
  readonly subject: string;
  readonly requesterId: string;
  readonly message: string;
  readonly relatedEntityType?: string | null;
  readonly relatedEntityId?: string | null;
}
