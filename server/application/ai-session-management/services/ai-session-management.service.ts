/**
 * AI Session Management — unified management for AI sessions.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { ISessionCatalog } from "@server/application/ai-session-management/contracts/session-catalog.contract";
import type { ISessionRepository } from "@server/application/ai-session-management/contracts/session-repository.contract";
import type { ISessionSerializer } from "@server/application/ai-session-management/contracts/session-serializer.contract";
import type { ISessionStatisticsProvider } from "@server/application/ai-session-management/contracts/session-statistics-provider.contract";
import type { ISessionValidator } from "@server/application/ai-session-management/contracts/session-validator.contract";
import {
  createSession,
  type CloseSessionResult,
  type CreateSessionInput,
  type FindSessionByNameResult,
  type ListSessionsByStatusResult,
  type ListSessionsResult,
  type Session,
  type SessionStatistics,
  type UpdateSessionInput,
} from "@server/application/ai-session-management/models/session.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiSessionManagementService {
  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly sessionCatalog: ISessionCatalog,
    private readonly sessionValidator: ISessionValidator,
    private readonly sessionSerializer: ISessionSerializer,
    private readonly statisticsProvider: ISessionStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async createSession(input: CreateSessionInput): Promise<Session> {
    const validation = await this.sessionValidator.validateCreation(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.sessionRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Session already exists with name: ${input.name.trim()}`);
    }

    const session = createSession({
      sessionId: this.idGenerator.generate(),
      name: input.name,
      description: input.description,
      status: input.status,
    });

    await this.sessionRepository.save(session);
    await this.sessionCatalog.register(session);
    return session;
  }

  async getSession(sessionId: string): Promise<Session | null> {
    return this.sessionRepository.findById(sessionId.trim());
  }

  async listSessions(): Promise<ListSessionsResult> {
    const sessions = Object.freeze(
      [...(await this.sessionRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ sessions, total: sessions.length });
  }

  async updateSession(input: UpdateSessionInput): Promise<Session> {
    const sessionId = input.sessionId.trim();
    const existing = await this.sessionRepository.findById(sessionId);
    if (!existing) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const validation = await this.sessionValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.sessionRepository.findByName(input.name.trim());
      if (duplicate && duplicate.sessionId !== existing.sessionId) {
        throw new Error(`Session already exists with name: ${input.name.trim()}`);
      }
    }

    const nextStatus = input.status ?? existing.status;
    const now = new Date().toISOString();
    const updated = createSession({
      sessionId: existing.sessionId,
      name: input.name?.trim() ?? existing.name,
      description: input.description ?? existing.description,
      status: nextStatus,
      createdAt: existing.createdAt,
      updatedAt: now,
      closedAt:
        nextStatus === "closed"
          ? existing.closedAt ?? now
          : nextStatus === "active"
            ? null
            : existing.closedAt,
    });

    await this.sessionRepository.save(updated);
    await this.sessionCatalog.register(updated);
    return updated;
  }

  async closeSession(sessionId: string): Promise<CloseSessionResult> {
    const normalizedSessionId = sessionId.trim();
    const existing = await this.sessionRepository.findById(normalizedSessionId);
    if (!existing) {
      return Object.freeze({ sessionId: normalizedSessionId, closed: false });
    }

    if (existing.status === "closed") {
      return Object.freeze({ sessionId: normalizedSessionId, closed: true });
    }

    const now = new Date().toISOString();
    const closed = createSession({
      sessionId: existing.sessionId,
      name: existing.name,
      description: existing.description,
      status: "closed",
      createdAt: existing.createdAt,
      updatedAt: now,
      closedAt: now,
    });

    await this.sessionRepository.save(closed);
    await this.sessionCatalog.register(closed);
    return Object.freeze({ sessionId: normalizedSessionId, closed: true });
  }

  async findSessionByName(name: string): Promise<FindSessionByNameResult> {
    const normalizedName = name.trim();
    const session = await this.sessionRepository.findByName(normalizedName);
    return Object.freeze({ session });
  }

  async listSessionsByStatus(status: string): Promise<ListSessionsByStatusResult> {
    const normalizedStatus = status.trim();
    const sessions = Object.freeze(
      [...(await this.sessionRepository.findByStatus(normalizedStatus))].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      sessions,
      total: sessions.length,
      status: normalizedStatus,
    });
  }

  async getSessionStatistics(): Promise<SessionStatistics> {
    const sessions = await this.sessionRepository.findAll();
    const activeSessions = sessions.filter((session) => session.status === "active").length;
    const closedSessions = sessions.filter((session) => session.status === "closed").length;

    return this.statisticsProvider.getStatistics({
      totalSessions: sessions.length,
      activeSessions,
      closedSessions,
    });
  }

  async serializeSession(session: Session): Promise<string> {
    return this.sessionSerializer.serialize(session);
  }

  async deserializeSession(serialized: string): Promise<Session> {
    return this.sessionSerializer.deserialize(serialized);
  }
}
