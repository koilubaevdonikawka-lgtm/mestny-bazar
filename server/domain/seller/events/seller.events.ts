import { DomainEvent } from "@server/domain/seller/events/domain-event.base";
import type { SellerLifecycleStatus } from "@server/domain/seller/status/seller-status";
import type { SellerVerificationLevel } from "@server/domain/seller/value-objects/seller-verification.vo";

export abstract class SellerDomainEventBase extends DomainEvent {
  protected constructor(
    readonly sellerId: string,
    occurredAt: string,
  ) {
    super(occurredAt);
  }
}

export class SellerRegisteredEvent extends SellerDomainEventBase {
  readonly eventName = "seller.registered" as const;

  constructor(
    sellerId: string,
    occurredAt: string,
    readonly payload: {
      name: string;
      status: SellerLifecycleStatus;
    },
  ) {
    super(sellerId, occurredAt);
  }
}

export class SellerUpdatedEvent extends SellerDomainEventBase {
  readonly eventName = "seller.updated" as const;

  constructor(
    sellerId: string,
    occurredAt: string,
    readonly payload: {
      name: string;
      email: string;
      phone: string;
      address: string;
    },
  ) {
    super(sellerId, occurredAt);
  }
}

export class SellerVerifiedEvent extends SellerDomainEventBase {
  readonly eventName = "seller.verified" as const;

  constructor(
    sellerId: string,
    occurredAt: string,
    readonly payload: {
      previousStatus: SellerLifecycleStatus;
      verificationLevel: SellerVerificationLevel;
    },
  ) {
    super(sellerId, occurredAt);
  }
}

export class SellerActivatedEvent extends SellerDomainEventBase {
  readonly eventName = "seller.activated" as const;

  constructor(
    sellerId: string,
    occurredAt: string,
    readonly payload: {
      previousStatus: SellerLifecycleStatus;
    },
  ) {
    super(sellerId, occurredAt);
  }
}

export class SellerSuspendedEvent extends SellerDomainEventBase {
  readonly eventName = "seller.suspended" as const;

  constructor(
    sellerId: string,
    occurredAt: string,
    readonly payload: {
      reason: string;
    },
  ) {
    super(sellerId, occurredAt);
  }
}

export class SellerBlockedEvent extends SellerDomainEventBase {
  readonly eventName = "seller.blocked" as const;

  constructor(
    sellerId: string,
    occurredAt: string,
    readonly payload: {
      reason: string;
      previousStatus: SellerLifecycleStatus;
    },
  ) {
    super(sellerId, occurredAt);
  }
}

export class SellerArchivedEvent extends SellerDomainEventBase {
  readonly eventName = "seller.archived" as const;

  constructor(
    sellerId: string,
    occurredAt: string,
    readonly payload: {
      previousStatus: SellerLifecycleStatus;
    },
  ) {
    super(sellerId, occurredAt);
  }
}

export type SellerDomainEvent =
  | SellerRegisteredEvent
  | SellerUpdatedEvent
  | SellerVerifiedEvent
  | SellerActivatedEvent
  | SellerSuspendedEvent
  | SellerBlockedEvent
  | SellerArchivedEvent;

export type SellerDomainEventType = SellerDomainEvent["eventName"];
