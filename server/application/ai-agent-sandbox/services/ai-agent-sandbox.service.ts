/**
 * AI Agent Sandbox — isolated execution environment for AI agents.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { ISandboxEnvironmentFactory } from "@server/application/ai-agent-sandbox/contracts/sandbox-environment-factory.contract";
import type { ISandboxLifecycleManager } from "@server/application/ai-agent-sandbox/contracts/sandbox-lifecycle-manager.contract";
import type { ISandboxRepository } from "@server/application/ai-agent-sandbox/contracts/sandbox-repository.contract";
import type { ISandboxSessionRepository } from "@server/application/ai-agent-sandbox/contracts/sandbox-session-repository.contract";
import type { ISandboxStatisticsProvider } from "@server/application/ai-agent-sandbox/contracts/sandbox-statistics-provider.contract";
import {
  createSandbox,
  createSandboxSession,
  type CreateSandboxSessionInput,
  type DeleteSandboxResult,
  type ListSandboxSessionsResult,
  type ListSandboxesResult,
  type RegisterSandboxInput,
  type Sandbox,
  type SandboxSession,
  type SandboxStatistics,
  type UpdateSandboxInput,
} from "@server/application/ai-agent-sandbox/models/sandbox.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiAgentSandboxService {
  constructor(
    private readonly sandboxRepository: ISandboxRepository,
    private readonly sessionRepository: ISandboxSessionRepository,
    private readonly environmentFactory: ISandboxEnvironmentFactory,
    private readonly lifecycleManager: ISandboxLifecycleManager,
    private readonly statisticsProvider: ISandboxStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerSandbox(input: RegisterSandboxInput): Promise<Sandbox> {
    const name = input.name.trim();

    if (!name) {
      throw new Error("Sandbox name is required.");
    }
    if (await this.sandboxRepository.findByName(name)) {
      throw new Error(`Sandbox already exists: ${name}`);
    }

    const sandbox = createSandbox({
      sandboxId: this.idGenerator.generate(),
      name,
      description: input.description,
      isolationLevel: input.isolationLevel,
      config: input.config,
      status: input.status,
    });

    await this.sandboxRepository.save(sandbox);
    return sandbox;
  }

  async getSandbox(sandboxId: string): Promise<Sandbox | null> {
    return this.sandboxRepository.findById(sandboxId.trim());
  }

  async listSandboxes(): Promise<ListSandboxesResult> {
    const sandboxes = Object.freeze(
      [...(await this.sandboxRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ sandboxes, total: sandboxes.length });
  }

  async updateSandbox(input: UpdateSandboxInput): Promise<Sandbox> {
    const sandboxId = input.sandboxId.trim();
    const existing = await this.sandboxRepository.findById(sandboxId);
    if (!existing) {
      throw new Error(`Sandbox not found: ${sandboxId}`);
    }

    const nextName = input.name?.trim() ?? existing.name;

    if (nextName !== existing.name && (await this.sandboxRepository.findByName(nextName))) {
      throw new Error(`Sandbox already exists: ${nextName}`);
    }

    const updated = createSandbox({
      sandboxId: existing.sandboxId,
      name: nextName,
      description: input.description ?? existing.description,
      isolationLevel: input.isolationLevel ?? existing.isolationLevel,
      config: input.config ?? existing.config,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.sandboxRepository.save(updated);
    return updated;
  }

  async deleteSandbox(sandboxId: string): Promise<DeleteSandboxResult> {
    const normalizedSandboxId = sandboxId.trim();
    const deleted = await this.sandboxRepository.delete(normalizedSandboxId);
    if (deleted) {
      await this.sessionRepository.deleteBySandboxId(normalizedSandboxId);
    }
    return Object.freeze({ sandboxId: normalizedSandboxId, deleted });
  }

  async createSandboxSession(input: CreateSandboxSessionInput): Promise<SandboxSession> {
    const sandboxId = input.sandboxId.trim();
    const name = input.name.trim();

    if (!name) {
      throw new Error("Sandbox session name is required.");
    }

    const sandbox = await this.sandboxRepository.findById(sandboxId);
    if (!sandbox) {
      throw new Error(`Sandbox not found: ${sandboxId}`);
    }
    if (sandbox.status !== "active") {
      throw new Error(`Sandbox is inactive: ${sandboxId}`);
    }

    const sessionId = this.idGenerator.generate();
    const factoryResult = await this.environmentFactory.create(sandbox, input, sessionId);
    const lifecycleResult = await this.lifecycleManager.initialize(factoryResult.session);

    await this.sessionRepository.save(lifecycleResult.session);
    return lifecycleResult.session;
  }

  async listSandboxSessions(): Promise<ListSandboxSessionsResult> {
    const sessions = Object.freeze(
      [...(await this.sessionRepository.findAll())].sort((left, right) =>
        left.createdAt.localeCompare(right.createdAt),
      ),
    );
    return Object.freeze({ sessions, total: sessions.length });
  }

  async getSandboxStatistics(): Promise<SandboxStatistics> {
    const sandboxes = await this.sandboxRepository.findAll();
    const sessions = await this.sessionRepository.findAll();
    const activeSandboxes = sandboxes.filter((sandbox) => sandbox.status === "active").length;
    const runningSessions = sessions.filter((session) => session.status === "running").length;

    return this.statisticsProvider.getStatistics({
      totalSandboxes: sandboxes.length,
      activeSandboxes,
      totalSessions: sessions.length,
      runningSessions,
    });
  }
}
