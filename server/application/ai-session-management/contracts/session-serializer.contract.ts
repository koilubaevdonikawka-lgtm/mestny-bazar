import type { Session } from "@server/application/ai-session-management/models/session.model";

export interface ISessionSerializer {
  serialize(session: Session): Promise<string>;
  deserialize(serialized: string): Promise<Session>;
}
