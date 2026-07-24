import type {
  CreateSandboxSessionInput,
  DeleteSandboxResult,
  ListSandboxSessionsResult,
  ListSandboxesResult,
  RegisterSandboxInput,
  Sandbox,
  SandboxSession,
  SandboxStatistics,
  UpdateSandboxInput,
} from "@server/application/ai-agent-sandbox/models/sandbox.model";
import type { AiAgentSandboxService } from "@server/application/ai-agent-sandbox/services/ai-agent-sandbox.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterSandboxUseCase {
  constructor(private readonly sandbox: AiAgentSandboxService) {}

  execute(input: RegisterSandboxInput): Promise<UseCaseResult<Sandbox>> {
    return this.sandbox.registerSandbox(input).then(useCaseResult);
  }
}

export class GetSandboxUseCase {
  constructor(private readonly sandbox: AiAgentSandboxService) {}

  execute(sandboxId: string): Promise<UseCaseResult<Sandbox | null>> {
    return this.sandbox.getSandbox(sandboxId).then(useCaseResult);
  }
}

export class ListSandboxesUseCase {
  constructor(private readonly sandbox: AiAgentSandboxService) {}

  execute(): Promise<UseCaseResult<ListSandboxesResult>> {
    return this.sandbox.listSandboxes().then(useCaseResult);
  }
}

export class UpdateSandboxUseCase {
  constructor(private readonly sandbox: AiAgentSandboxService) {}

  execute(input: UpdateSandboxInput): Promise<UseCaseResult<Sandbox>> {
    return this.sandbox.updateSandbox(input).then(useCaseResult);
  }
}

export class DeleteSandboxUseCase {
  constructor(private readonly sandbox: AiAgentSandboxService) {}

  execute(sandboxId: string): Promise<UseCaseResult<DeleteSandboxResult>> {
    return this.sandbox.deleteSandbox(sandboxId).then(useCaseResult);
  }
}

export class CreateSandboxSessionUseCase {
  constructor(private readonly sandbox: AiAgentSandboxService) {}

  execute(input: CreateSandboxSessionInput): Promise<UseCaseResult<SandboxSession>> {
    return this.sandbox.createSandboxSession(input).then(useCaseResult);
  }
}

export class ListSandboxSessionsUseCase {
  constructor(private readonly sandbox: AiAgentSandboxService) {}

  execute(): Promise<UseCaseResult<ListSandboxSessionsResult>> {
    return this.sandbox.listSandboxSessions().then(useCaseResult);
  }
}

export class GetSandboxStatisticsUseCase {
  constructor(private readonly sandbox: AiAgentSandboxService) {}

  execute(): Promise<UseCaseResult<SandboxStatistics>> {
    return this.sandbox.getSandboxStatistics().then(useCaseResult);
  }
}
