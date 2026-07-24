import type {
  CreateSandboxSessionInput,
  RegisterSandboxInput,
  UpdateSandboxInput,
} from "@server/application/ai-agent-sandbox/models/sandbox.model";
import {
  CreateSandboxSessionUseCase,
  DeleteSandboxUseCase,
  GetSandboxStatisticsUseCase,
  GetSandboxUseCase,
  ListSandboxSessionsUseCase,
  ListSandboxesUseCase,
  RegisterSandboxUseCase,
  UpdateSandboxUseCase,
} from "@server/application/ai-agent-sandbox/use-cases/ai-agent-sandbox.use-cases";

/** Application facade for AI Agent Sandbox scenario. */
export class AiAgentSandboxApplicationService {
  constructor(
    private readonly registerSandboxUseCase: RegisterSandboxUseCase,
    private readonly getSandboxUseCase: GetSandboxUseCase,
    private readonly listSandboxesUseCase: ListSandboxesUseCase,
    private readonly updateSandboxUseCase: UpdateSandboxUseCase,
    private readonly deleteSandboxUseCase: DeleteSandboxUseCase,
    private readonly createSandboxSessionUseCase: CreateSandboxSessionUseCase,
    private readonly listSandboxSessionsUseCase: ListSandboxSessionsUseCase,
    private readonly getSandboxStatisticsUseCase: GetSandboxStatisticsUseCase,
  ) {}

  registerSandbox(input: RegisterSandboxInput) {
    return this.registerSandboxUseCase.execute(input);
  }

  getSandbox(sandboxId: string) {
    return this.getSandboxUseCase.execute(sandboxId);
  }

  listSandboxes() {
    return this.listSandboxesUseCase.execute();
  }

  updateSandbox(input: UpdateSandboxInput) {
    return this.updateSandboxUseCase.execute(input);
  }

  deleteSandbox(sandboxId: string) {
    return this.deleteSandboxUseCase.execute(sandboxId);
  }

  createSandboxSession(input: CreateSandboxSessionInput) {
    return this.createSandboxSessionUseCase.execute(input);
  }

  listSandboxSessions() {
    return this.listSandboxSessionsUseCase.execute();
  }

  getSandboxStatistics() {
    return this.getSandboxStatisticsUseCase.execute();
  }
}
