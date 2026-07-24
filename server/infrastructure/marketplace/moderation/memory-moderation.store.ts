import type { IModerationStore } from "@server/application/modules/moderation/moderation/contracts";
import type { ModerationRequest } from "@server/application/modules/moderation/moderation/models";
import type { ModerationTargetValue } from "@server/application/modules/moderation/moderation/models/moderation-target.model";
import { InMemoryStore } from "@server/infrastructure/shared";

/** In-memory moderation store for development and tests. */
export class MemoryModerationStore implements IModerationStore {
  private readonly requests = new InMemoryStore<ModerationRequest>((request) => request.id);
  private readonly latestByTarget = new Map<string, string>();

  async saveRequest(request: ModerationRequest): Promise<void> {
    this.requests.set(request);
    this.latestByTarget.set(targetKey(request.target, request.targetId), request.id);
  }

  async updateRequest(request: ModerationRequest): Promise<void> {
    if (!this.requests.has(request.id)) {
      throw new Error(`Moderation request not found: ${request.id}`);
    }
    this.requests.set(request);
    this.latestByTarget.set(targetKey(request.target, request.targetId), request.id);
  }

  async findRequestById(requestId: string): Promise<ModerationRequest | null> {
    return this.requests.get(requestId.trim()) ?? null;
  }

  async findLatestRequestByTarget(
    target: ModerationTargetValue,
    targetId: string,
  ): Promise<ModerationRequest | null> {
    const requestId = this.latestByTarget.get(targetKey(target, targetId.trim()));
    if (!requestId) {
      return null;
    }
    return this.requests.get(requestId) ?? null;
  }
}

function targetKey(target: ModerationTargetValue, targetId: string): string {
  return `${target}:${targetId.trim()}`;
}
