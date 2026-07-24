import type { ModerationModule } from "@server/application/modules/moderation/moderation/api/moderation.module";
import { ModerationTarget } from "@server/application/modules/moderation/moderation/models";
import type { ISupportStore } from "@server/application/modules/support/support/contracts";
import type {
  CloseTicketDto,
  CreateComplaintDto,
  CreateDisputeDto,
  CreateSuggestionDto,
  CreateTicketDto,
  GetTicketStatusDto,
  ReplyTicketDto,
} from "@server/application/modules/support/support/dto";
import {
  createComplaintCreatedEvent,
  createDisputeCreatedEvent,
  createSuggestionCreatedEvent,
  createTicketClosedEvent,
  createTicketCreatedEvent,
  createTicketRepliedEvent,
} from "@server/application/modules/support/support/events";
import {
  canCloseSupportTicket,
  canReplyToSupportTicket,
  createComplaint,
  createDispute,
  createSuggestion,
  createSupportMessage,
  createSupportTicket,
  SupportStatus,
  SupportTicketKind,
  withSupportTicketMessage,
  withSupportTicketStatus,
  type Complaint,
  type Dispute,
  type Suggestion,
  type SupportStatusValue,
  type SupportTicket,
} from "@server/application/modules/support/support/models";
import { SupportPriorityPolicy } from "@server/application/modules/support/support/policies/support-priority.policy";
import { SupportRoutingPolicy } from "@server/application/modules/support/support/policies/support-routing.policy";
import type { IIdGenerator } from "@server/application/ports";

/** Support business capability service — orchestrates tickets via ISupportStore. */
export class SupportService {
  private readonly routingPolicy = new SupportRoutingPolicy();
  private readonly priorityPolicy = new SupportPriorityPolicy();

  constructor(
    private readonly store: ISupportStore,
    private readonly idGenerator: IIdGenerator,
    private readonly moderation: ModerationModule,
  ) {}

  async createTicket(dto: CreateTicketDto): Promise<SupportTicket> {
    validateCreateTicketDto(dto);

    const ticketId = this.idGenerator.generate();
    const message = createSupportMessage({
      id: this.idGenerator.generate(),
      ticketId,
      authorId: dto.requesterId,
      body: dto.message,
    });

    const ticket = createSupportTicket({
      id: ticketId,
      subject: dto.subject,
      kind: SupportTicketKind.General,
      priority: this.priorityPolicy.resolvePriority(SupportTicketKind.General),
      requesterId: dto.requesterId,
      relatedEntityType: dto.relatedEntityType,
      relatedEntityId: dto.relatedEntityId,
      initialMessage: message,
    });

    await this.store.saveTicket(ticket);
    createTicketCreatedEvent(ticket);

    return ticket;
  }

  async reply(dto: ReplyTicketDto): Promise<SupportTicket> {
    validateReplyTicketDto(dto);

    const ticket = await this.requireTicket(dto.ticketId);
    if (!canReplyToSupportTicket(ticket)) {
      throw new Error(`Support ticket ${ticket.id} cannot receive replies.`);
    }

    const message = createSupportMessage({
      id: this.idGenerator.generate(),
      ticketId: ticket.id,
      authorId: dto.authorId,
      body: dto.message,
    });

    const updated = withSupportTicketMessage(
      withSupportTicketStatus(ticket, SupportStatus.InProgress),
      message,
    );
    await this.store.updateTicket(updated);
    createTicketRepliedEvent(updated, message);

    return updated;
  }

  async close(dto: CloseTicketDto): Promise<SupportTicket> {
    validateCloseTicketDto(dto);

    const ticket = await this.requireTicket(dto.ticketId);
    if (!canCloseSupportTicket(ticket)) {
      throw new Error(`Support ticket ${ticket.id} is already closed.`);
    }

    const closed = withSupportTicketStatus(ticket, SupportStatus.Closed);
    await this.store.updateTicket(closed);
    createTicketClosedEvent(closed);

    return closed;
  }

  async createComplaint(dto: CreateComplaintDto): Promise<Complaint> {
    validateCreateComplaintDto(dto);

    const ticketId = this.idGenerator.generate();
    const complaintId = ticketId;
    const message = createSupportMessage({
      id: this.idGenerator.generate(),
      ticketId,
      authorId: dto.complainantId,
      body: dto.description,
    });

    const ticket = createSupportTicket({
      id: ticketId,
      subject: `Complaint: ${dto.reason}`,
      kind: SupportTicketKind.Complaint,
      priority: this.priorityPolicy.resolvePriority(SupportTicketKind.Complaint, {
        targetType: dto.targetType,
      }),
      requesterId: dto.complainantId,
      relatedEntityType: dto.targetType,
      relatedEntityId: dto.targetId,
      initialMessage: message,
    });

    const complaint = createComplaint({
      id: complaintId,
      ticketId,
      complainantId: dto.complainantId,
      targetType: dto.targetType,
      targetId: dto.targetId,
      reason: dto.reason,
      description: dto.description,
    });

    await this.store.saveTicket(ticket);
    await this.store.saveComplaint(complaint);
    createTicketCreatedEvent(ticket);
    createComplaintCreatedEvent(complaint);

    if (this.routingPolicy.shouldRouteToModeration(ticket.kind)) {
      await this.moderation.requestModeration({
        target: ModerationTarget.Complaint,
        targetId: complaint.id,
        requestedBy: dto.complainantId,
      });
    }

    return complaint;
  }

  async createSuggestion(dto: CreateSuggestionDto): Promise<Suggestion> {
    validateCreateSuggestionDto(dto);

    const ticketId = this.idGenerator.generate();
    const suggestionId = ticketId;
    const message = createSupportMessage({
      id: this.idGenerator.generate(),
      ticketId,
      authorId: dto.authorId,
      body: dto.description,
    });

    const ticket = createSupportTicket({
      id: ticketId,
      subject: dto.title,
      kind: SupportTicketKind.Suggestion,
      priority: this.priorityPolicy.resolvePriority(SupportTicketKind.Suggestion),
      requesterId: dto.authorId,
      initialMessage: message,
    });

    const suggestion = createSuggestion({
      id: suggestionId,
      ticketId,
      authorId: dto.authorId,
      title: dto.title,
      description: dto.description,
    });

    await this.store.saveTicket(ticket);
    await this.store.saveSuggestion(suggestion);
    createTicketCreatedEvent(ticket);
    createSuggestionCreatedEvent(suggestion);

    return suggestion;
  }

  async createDispute(dto: CreateDisputeDto): Promise<Dispute> {
    validateCreateDisputeDto(dto);

    const ticketId = this.idGenerator.generate();
    const disputeId = ticketId;
    const message = createSupportMessage({
      id: this.idGenerator.generate(),
      ticketId,
      authorId: dto.initiatorId,
      body: dto.description,
    });

    const ticket = createSupportTicket({
      id: ticketId,
      subject: `Dispute: ${dto.reason}`,
      kind: SupportTicketKind.Dispute,
      priority: this.priorityPolicy.resolvePriority(SupportTicketKind.Dispute, {
        orderId: dto.orderId,
      }),
      requesterId: dto.initiatorId,
      relatedEntityType: dto.orderId ? "order" : null,
      relatedEntityId: dto.orderId,
      initialMessage: message,
    });

    const dispute = createDispute({
      id: disputeId,
      ticketId,
      initiatorId: dto.initiatorId,
      counterpartyId: dto.counterpartyId,
      orderId: dto.orderId,
      reason: dto.reason,
      description: dto.description,
    });

    await this.store.saveTicket(ticket);
    await this.store.saveDispute(dispute);
    createTicketCreatedEvent(ticket);
    createDisputeCreatedEvent(dispute);

    return dispute;
  }

  async getTicket(ticketId: string): Promise<SupportTicket | null> {
    return this.store.findTicketById(ticketId.trim());
  }

  async getStatus(dto: GetTicketStatusDto): Promise<SupportStatusValue> {
    if (!dto.ticketId?.trim()) {
      throw new Error("Ticket id is required.");
    }

    const ticket = await this.store.findTicketById(dto.ticketId.trim());
    return ticket?.status ?? SupportStatus.Open;
  }

  private async requireTicket(ticketId: string): Promise<SupportTicket> {
    const ticket = await this.store.findTicketById(ticketId.trim());
    if (!ticket) {
      throw new Error(`Support ticket not found: ${ticketId}`);
    }
    return ticket;
  }
}

function validateCreateTicketDto(dto: CreateTicketDto): void {
  if (!dto.subject?.trim()) {
    throw new Error("Ticket subject is required.");
  }
  if (!dto.requesterId?.trim()) {
    throw new Error("Requester id is required.");
  }
  if (!dto.message?.trim()) {
    throw new Error("Ticket message is required.");
  }
}

function validateReplyTicketDto(dto: ReplyTicketDto): void {
  if (!dto.ticketId?.trim()) {
    throw new Error("Ticket id is required.");
  }
  if (!dto.authorId?.trim()) {
    throw new Error("Author id is required.");
  }
  if (!dto.message?.trim()) {
    throw new Error("Reply message is required.");
  }
}

function validateCloseTicketDto(dto: CloseTicketDto): void {
  if (!dto.ticketId?.trim()) {
    throw new Error("Ticket id is required.");
  }
  if (!dto.closedBy?.trim()) {
    throw new Error("Closed by id is required.");
  }
}

function validateCreateComplaintDto(dto: CreateComplaintDto): void {
  if (!dto.complainantId?.trim()) {
    throw new Error("Complainant id is required.");
  }
  if (!dto.targetType?.trim()) {
    throw new Error("Complaint target type is required.");
  }
  if (!dto.targetId?.trim()) {
    throw new Error("Complaint target id is required.");
  }
  if (!dto.reason?.trim()) {
    throw new Error("Complaint reason is required.");
  }
  if (!dto.description?.trim()) {
    throw new Error("Complaint description is required.");
  }
}

function validateCreateSuggestionDto(dto: CreateSuggestionDto): void {
  if (!dto.authorId?.trim()) {
    throw new Error("Suggestion author id is required.");
  }
  if (!dto.title?.trim()) {
    throw new Error("Suggestion title is required.");
  }
  if (!dto.description?.trim()) {
    throw new Error("Suggestion description is required.");
  }
}

function validateCreateDisputeDto(dto: CreateDisputeDto): void {
  if (!dto.initiatorId?.trim()) {
    throw new Error("Dispute initiator id is required.");
  }
  if (!dto.counterpartyId?.trim()) {
    throw new Error("Dispute counterparty id is required.");
  }
  if (!dto.reason?.trim()) {
    throw new Error("Dispute reason is required.");
  }
  if (!dto.description?.trim()) {
    throw new Error("Dispute description is required.");
  }
}
