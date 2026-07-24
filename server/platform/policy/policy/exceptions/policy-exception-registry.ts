import type { IPolicyExceptionRegistry } from "@server/platform/policy/policy/contracts";
import {
  createPolicyException,
  type PolicyException,
  type PolicyExceptionKind,
} from "@server/platform/policy/policy/models";
import { createPolicyExceptionRegisteredEvent } from "@server/platform/policy/policy/events";

/** Registers approved, temporary and deprecated policy exceptions (metadata only). */
export class PolicyExceptionRegistry implements IPolicyExceptionRegistry {
  private readonly exceptions = new Map<string, PolicyException>();

  register(exception: PolicyException): PolicyException {
    const stored = createPolicyException(exception);
    this.exceptions.set(stored.id, stored);
    createPolicyExceptionRegisteredEvent(stored);
    return stored;
  }

  get(exceptionId: string): PolicyException | undefined {
    return this.exceptions.get(exceptionId.trim());
  }

  list(kind?: PolicyExceptionKind): readonly PolicyException[] {
    const values = [...this.exceptions.values()];
    const filtered = kind ? values.filter((exception) => exception.kind === kind) : values;
    return Object.freeze([...filtered]);
  }

  hasException(policyId: string): boolean {
    return [...this.exceptions.values()].some(
      (exception) => exception.policyId === policyId.trim(),
    );
  }
}
