import { SellerPolicyViolationError } from "@server/domain/seller/exceptions/seller.errors";
import {
  SellerActivatedEvent,
  SellerArchivedEvent,
  SellerBlockedEvent,
  SellerRegisteredEvent,
  SellerSuspendedEvent,
  SellerUpdatedEvent,
  SellerVerifiedEvent,
  type SellerDomainEvent,
} from "@server/domain/seller/events/seller.events";
import { SellerLifecycle } from "@server/domain/seller/lifecycle/seller-lifecycle";
import { SellerPolicy, type SellerPolicySnapshot } from "@server/domain/seller/policies/seller.policy";
import { SellerSnapshot, type SellerReadModel } from "@server/domain/seller/snapshot/seller-snapshot";
import { SellerLifecycleStatus } from "@server/domain/seller/status/seller-status";
import {
  SellerAddress,
  SellerEmail,
  SellerId,
  SellerLimits,
  SellerName,
  SellerPhone,
  SellerRating,
  SellerStatus,
  SellerVerification,
} from "@server/domain/seller/value-objects";

export interface RegisterSellerProps {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  limits?: Partial<ReturnType<SellerLimits["toJSON"]>>;
}

export interface ReconstituteSellerProps {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  status: SellerLifecycleStatus;
  verification: ReturnType<SellerVerification["toJSON"]>;
  rating: ReturnType<SellerRating["toJSON"]>;
  limits: ReturnType<SellerLimits["toJSON"]>;
  createdAt: string;
  updatedAt: string;
}

export type { SellerReadModel };

/** Seller aggregate root — sole entry point for seller state mutations. */
export class Seller {
  private readonly domainEvents: SellerDomainEvent[] = [];
  private readonly policy = new SellerPolicy();

  private constructor(
    private readonly id: SellerId,
    private name: SellerName,
    private phone: SellerPhone,
    private email: SellerEmail,
    private address: SellerAddress,
    private status: SellerStatus,
    private verification: SellerVerification,
    private rating: SellerRating,
    private limits: SellerLimits,
    private readonly createdAt: string,
    private updatedAt: string,
  ) {}

  static register(props: RegisterSellerProps): Seller {
    const now = new Date().toISOString();
    const seller = new Seller(
      SellerId.create(props.id),
      SellerName.create(props.name),
      SellerPhone.create(props.phone),
      SellerEmail.create(props.email),
      SellerAddress.create(props.address),
      SellerStatus.registered(),
      SellerVerification.initial(),
      SellerRating.initial(),
      props.limits ? SellerLimits.create(props.limits) : SellerLimits.default(),
      now,
      now,
    );

    seller.record(
      new SellerRegisteredEvent(seller.id.toString(), now, {
        name: seller.name.toString(),
        status: seller.status.toString(),
      }),
    );

    return seller;
  }

  static reconstitute(props: ReconstituteSellerProps): Seller {
    return new Seller(
      SellerId.create(props.id),
      SellerName.create(props.name),
      SellerPhone.create(props.phone),
      SellerEmail.create(props.email),
      SellerAddress.create(props.address),
      SellerStatus.create(props.status),
      SellerVerification.from(props.verification),
      SellerRating.from(props.rating),
      SellerLimits.from(props.limits),
      props.createdAt,
      props.updatedAt,
    );
  }

  updateProfile(input: {
    name: string;
    phone: string;
    email: string;
    address: string;
  }): void {
    this.assertPolicy(this.policy.canUpdateProfile.bind(this.policy), "update_profile");

    this.name = SellerName.create(input.name);
    this.phone = SellerPhone.create(input.phone);
    this.email = SellerEmail.create(input.email);
    this.address = SellerAddress.create(input.address);
    this.touch();

    this.record(
      new SellerUpdatedEvent(this.id.toString(), this.updatedAt, {
        name: this.name.toString(),
        email: this.email.toString(),
        phone: this.phone.toString(),
        address: this.address.toString(),
      }),
    );
  }

  submitVerification(): void {
    this.assertPolicy(this.policy.canSubmitVerification.bind(this.policy), "submit_verification");

    const now = this.updatedAtIso();
    this.verification = SellerVerification.pending(now);
    this.transitionStatus("submit_verification");
  }

  verify(): void {
    const previousStatus = this.status.toString();
    this.transitionStatus("verify");
    this.verification = SellerVerification.verified(
      this.verification.toJSON().submittedAt,
      this.updatedAt,
    );
    this.touch();

    this.record(
      new SellerVerifiedEvent(this.id.toString(), this.updatedAt, {
        previousStatus,
        verificationLevel: this.verification.levelValue(),
      }),
    );
  }

  rejectVerification(reason: string): void {
    if (this.status.toString() !== SellerLifecycleStatus.PendingVerification) {
      throw new SellerPolicyViolationError(
        "Verification can only be rejected while pending",
        "reject_verification",
      );
    }

    this.verification = SellerVerification.rejected(this.verification.toJSON().submittedAt, reason);
    this.transitionStatus("reject_verification");
  }

  activate(): void {
    this.assertPolicy(this.policy.canActivate.bind(this.policy), "activate");

    const previousStatus = this.status.toString();
    this.transitionStatus("activate");
    this.record(
      new SellerActivatedEvent(this.id.toString(), this.updatedAt, {
        previousStatus,
      }),
    );
  }

  suspend(reason: string): void {
    this.assertPolicy(this.policy.canSuspend.bind(this.policy), "suspend");

    const normalizedReason = reason?.trim();
    if (!normalizedReason) {
      throw new SellerPolicyViolationError("Suspension reason is required", "suspend");
    }

    this.transitionStatus("suspend");
    this.record(
      new SellerSuspendedEvent(this.id.toString(), this.updatedAt, {
        reason: normalizedReason,
      }),
    );
  }

  reinstate(): void {
    this.assertPolicy(this.policy.canReinstate.bind(this.policy), "reinstate");
    this.transitionStatus("reinstate");
  }

  block(reason: string): void {
    this.assertPolicy(this.policy.canBlock.bind(this.policy), "block");

    const normalizedReason = reason?.trim();
    if (!normalizedReason) {
      throw new SellerPolicyViolationError("Block reason is required", "block");
    }

    const previousStatus = this.status.toString();
    this.transitionStatus("block");
    this.record(
      new SellerBlockedEvent(this.id.toString(), this.updatedAt, {
        reason: normalizedReason,
        previousStatus,
      }),
    );
  }

  archive(): void {
    this.assertPolicy(this.policy.canArchive.bind(this.policy), "archive");

    const previousStatus = this.status.toString();
    this.transitionStatus("archive");
    this.record(
      new SellerArchivedEvent(this.id.toString(), this.updatedAt, {
        previousStatus,
      }),
    );
  }

  updateLimits(input: Partial<ReturnType<SellerLimits["toJSON"]>>): void {
    this.limits = SellerLimits.create({ ...this.limits.toJSON(), ...input });
    this.touch();
  }

  updateRating(score: number, reviewCount: number): void {
    this.rating = SellerRating.create(score, reviewCount);
    this.touch();
  }

  pullDomainEvents(): SellerDomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents.length = 0;
    return events;
  }

  peekDomainEvents(): readonly SellerDomainEvent[] {
    return [...this.domainEvents];
  }

  snapshot(): SellerSnapshot {
    return SellerSnapshot.capture({
      id: this.id,
      name: this.name,
      phone: this.phone,
      email: this.email,
      address: this.address,
      status: this.status,
      verification: this.verification,
      rating: this.rating,
      limits: this.limits,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }

  private transitionStatus(action: Parameters<typeof SellerLifecycle.transition>[1]): void {
    const next = SellerLifecycle.transition(this.status.toString(), action);
    this.status = SellerStatus.create(next);
    this.touch();
  }

  private policySnapshot(): SellerPolicySnapshot {
    return {
      status: this.status.toString(),
      verification: this.verification,
    };
  }

  private assertPolicy(
    predicate: (snapshot: SellerPolicySnapshot) => boolean,
    action: string,
  ): void {
    if (!predicate(this.policySnapshot())) {
      throw new SellerPolicyViolationError(
        `Action "${action}" is not permitted for seller in status "${this.status.toString()}"`,
        action,
      );
    }
  }

  private updatedAtIso(): string {
    return new Date().toISOString();
  }

  private touch(): void {
    this.updatedAt = this.updatedAtIso();
  }

  private record(event: SellerDomainEvent): void {
    this.domainEvents.push(Object.freeze(event));
  }
}
