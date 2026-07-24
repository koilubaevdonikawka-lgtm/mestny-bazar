import type {
  CloseTicketDto,
  CreateComplaintDto,
  CreateDisputeDto,
  CreateSuggestionDto,
  CreateTicketDto,
  GetTicketStatusDto,
  ReplyTicketDto,
} from "@server/application/modules/support/support/dto";
import type {
  Complaint,
  Dispute,
  Suggestion,
  SupportStatusValue,
  SupportTicket,
} from "@server/application/modules/support/support/models";
import type { SupportService } from "@server/application/modules/support/support/services";

/** Public entry point for the Support business capability module. */
export class SupportModule {
  constructor(private readonly service: SupportService) {}

  createTicket(dto: CreateTicketDto): Promise<SupportTicket> {
    return this.service.createTicket(dto);
  }

  reply(dto: ReplyTicketDto): Promise<SupportTicket> {
    return this.service.reply(dto);
  }

  close(dto: CloseTicketDto): Promise<SupportTicket> {
    return this.service.close(dto);
  }

  createComplaint(dto: CreateComplaintDto): Promise<Complaint> {
    return this.service.createComplaint(dto);
  }

  createSuggestion(dto: CreateSuggestionDto): Promise<Suggestion> {
    return this.service.createSuggestion(dto);
  }

  createDispute(dto: CreateDisputeDto): Promise<Dispute> {
    return this.service.createDispute(dto);
  }

  getTicket(ticketId: string): Promise<SupportTicket | null> {
    return this.service.getTicket(ticketId);
  }

  getStatus(dto: GetTicketStatusDto): Promise<SupportStatusValue> {
    return this.service.getStatus(dto);
  }
}
