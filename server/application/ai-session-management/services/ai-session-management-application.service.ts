import type {
  CreateSessionInput,
  UpdateSessionInput,
} from "@server/application/ai-session-management/models/session.model";
import {
  CloseSessionUseCase,
  CreateSessionUseCase,
  FindSessionByNameUseCase,
  GetSessionStatisticsUseCase,
  GetSessionUseCase,
  ListSessionsByStatusUseCase,
  ListSessionsUseCase,
  UpdateSessionUseCase,
} from "@server/application/ai-session-management/use-cases/ai-session-management.use-cases";

/** Application facade for AI Session Management scenario. */
export class AiSessionManagementApplicationService {
  constructor(
    private readonly createSessionUseCase: CreateSessionUseCase,
    private readonly getSessionUseCase: GetSessionUseCase,
    private readonly listSessionsUseCase: ListSessionsUseCase,
    private readonly updateSessionUseCase: UpdateSessionUseCase,
    private readonly closeSessionUseCase: CloseSessionUseCase,
    private readonly findSessionByNameUseCase: FindSessionByNameUseCase,
    private readonly listSessionsByStatusUseCase: ListSessionsByStatusUseCase,
    private readonly getSessionStatisticsUseCase: GetSessionStatisticsUseCase,
  ) {}

  createSession(input: CreateSessionInput) {
    return this.createSessionUseCase.execute(input);
  }

  getSession(sessionId: string) {
    return this.getSessionUseCase.execute(sessionId);
  }

  listSessions() {
    return this.listSessionsUseCase.execute();
  }

  updateSession(input: UpdateSessionInput) {
    return this.updateSessionUseCase.execute(input);
  }

  closeSession(sessionId: string) {
    return this.closeSessionUseCase.execute(sessionId);
  }

  findSessionByName(name: string) {
    return this.findSessionByNameUseCase.execute(name);
  }

  listSessionsByStatus(status: string) {
    return this.listSessionsByStatusUseCase.execute(status);
  }

  getSessionStatistics() {
    return this.getSessionStatisticsUseCase.execute();
  }
}
