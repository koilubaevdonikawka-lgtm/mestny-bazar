import type {
  CloseSessionResult,
  CreateSessionInput,
  FindSessionByNameResult,
  ListSessionsByStatusResult,
  ListSessionsResult,
  Session,
  SessionStatistics,
  UpdateSessionInput,
} from "@server/application/ai-session-management/models/session.model";
import type { AiSessionManagementService } from "@server/application/ai-session-management/services/ai-session-management.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class CreateSessionUseCase {
  constructor(private readonly sessionManagement: AiSessionManagementService) {}

  execute(input: CreateSessionInput): Promise<UseCaseResult<Session>> {
    return this.sessionManagement.createSession(input).then(useCaseResult);
  }
}

export class GetSessionUseCase {
  constructor(private readonly sessionManagement: AiSessionManagementService) {}

  execute(sessionId: string): Promise<UseCaseResult<Session | null>> {
    return this.sessionManagement.getSession(sessionId).then(useCaseResult);
  }
}

export class ListSessionsUseCase {
  constructor(private readonly sessionManagement: AiSessionManagementService) {}

  execute(): Promise<UseCaseResult<ListSessionsResult>> {
    return this.sessionManagement.listSessions().then(useCaseResult);
  }
}

export class UpdateSessionUseCase {
  constructor(private readonly sessionManagement: AiSessionManagementService) {}

  execute(input: UpdateSessionInput): Promise<UseCaseResult<Session>> {
    return this.sessionManagement.updateSession(input).then(useCaseResult);
  }
}

export class CloseSessionUseCase {
  constructor(private readonly sessionManagement: AiSessionManagementService) {}

  execute(sessionId: string): Promise<UseCaseResult<CloseSessionResult>> {
    return this.sessionManagement.closeSession(sessionId).then(useCaseResult);
  }
}

export class FindSessionByNameUseCase {
  constructor(private readonly sessionManagement: AiSessionManagementService) {}

  execute(name: string): Promise<UseCaseResult<FindSessionByNameResult>> {
    return this.sessionManagement.findSessionByName(name).then(useCaseResult);
  }
}

export class ListSessionsByStatusUseCase {
  constructor(private readonly sessionManagement: AiSessionManagementService) {}

  execute(status: string): Promise<UseCaseResult<ListSessionsByStatusResult>> {
    return this.sessionManagement.listSessionsByStatus(status).then(useCaseResult);
  }
}

export class GetSessionStatisticsUseCase {
  constructor(private readonly sessionManagement: AiSessionManagementService) {}

  execute(): Promise<UseCaseResult<SessionStatistics>> {
    return this.sessionManagement.getSessionStatistics().then(useCaseResult);
  }
}
