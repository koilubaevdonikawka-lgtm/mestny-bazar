import type { ISessionSerializer } from "@server/application/ai-session-management/contracts/session-serializer.contract";
import {
  createSession,
  type Session,
} from "@server/application/ai-session-management/models/session.model";

/** JSON-based session serializer. */
export class JsonSessionSerializer implements ISessionSerializer {
  async serialize(session: Session): Promise<string> {
    return JSON.stringify(session);
  }

  async deserialize(serialized: string): Promise<Session> {
    if (!serialized.trim()) {
      throw new Error("Serialized session cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<Session>;
    return createSession({
      sessionId: parsed.sessionId ?? "",
      name: parsed.name ?? "",
      description: parsed.description,
      status: parsed.status,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
      closedAt: parsed.closedAt,
    });
  }
}
