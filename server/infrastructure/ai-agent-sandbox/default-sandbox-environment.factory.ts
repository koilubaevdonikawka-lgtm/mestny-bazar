import type {
  ISandboxEnvironmentFactory,
  SandboxEnvironmentFactoryResult,
} from "@server/application/ai-agent-sandbox/contracts/sandbox-environment-factory.contract";
import {
  createSandboxSession,
  type CreateSandboxSessionInput,
  type Sandbox,
} from "@server/application/ai-agent-sandbox/models/sandbox.model";

/** Mock sandbox environment factory — no real OS processes or containers. */
export class DefaultSandboxEnvironmentFactory implements ISandboxEnvironmentFactory {
  async create(
    sandbox: Sandbox,
    input: CreateSandboxSessionInput,
    sessionId: string,
  ): Promise<SandboxEnvironmentFactoryResult> {
    const session = createSandboxSession({
      sessionId,
      sandboxId: sandbox.sandboxId,
      name: input.name,
      config: input.config ?? sandbox.config,
      status: "created",
      mock: true,
    });

    return Object.freeze({ session, mock: true });
  }
}
