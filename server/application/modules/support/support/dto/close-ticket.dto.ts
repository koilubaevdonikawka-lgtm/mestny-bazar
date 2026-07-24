export interface CloseTicketDto {
  readonly ticketId: string;
  readonly closedBy: string;
}

export interface GetTicketStatusDto {
  readonly ticketId: string;
}
