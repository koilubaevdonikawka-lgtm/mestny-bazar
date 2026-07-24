import type {
  CreateSandboxSessionInput,
  Sandbox,
  SandboxSession,
} from "@server/application/ai-agent-sandbox/models/sandbox.model";

export interface SandboxEnvironmentFactoryResult {
  readonly session: SandboxSession;
  readonly mock: boolean;
}

export interface ISandboxEnvironmentFactory {
  create(
    sandbox: Sandbox,
    input: CreateSandboxSessionInput,
    sessionId: string,
  ): Promise<SandboxEnvironmentFactoryResult>;
}
