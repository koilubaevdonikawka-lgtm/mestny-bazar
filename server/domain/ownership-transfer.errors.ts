/** Only a current Root Owner may initiate a Transfer (docs/architecture/PLATFORM_OWNERSHIP_ARCHITECTURE.md §7). */
export class NotRootOwnerError extends Error {
  constructor() {
    super("Only a Root Owner may initiate Ownership Transfer");
    this.name = "NotRootOwnerError";
  }
}

/** A transfer cannot target the same account that initiated it. */
export class SelfTransferError extends Error {
  constructor() {
    super("A Transfer cannot target the initiator's own account");
    this.name = "SelfTransferError";
  }
}

export class OwnershipTransferNotFoundError extends Error {
  constructor() {
    super("Ownership transfer not found");
    this.name = "OwnershipTransferNotFoundError";
  }
}

/** Acting user is neither the initiator nor the target of this transfer (or lacks the specific right for this action). */
export class OwnershipTransferForbiddenError extends Error {
  constructor(message = "Not permitted to act on this ownership transfer") {
    super(message);
    this.name = "OwnershipTransferForbiddenError";
  }
}

/** The transfer is not in the state required for the attempted action (e.g. accept/cancel on a non-PENDING row, complete on a non-ACCEPTED row). */
export class OwnershipTransferInvalidStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OwnershipTransferInvalidStateError";
  }
}
