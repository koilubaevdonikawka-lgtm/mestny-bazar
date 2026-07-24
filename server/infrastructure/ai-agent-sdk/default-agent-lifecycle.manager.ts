import type {
  AgentLifecycleResult,
  IAgentLifecycleManager,
} from "@server/application/ai-agent-sdk/contracts/agent-lifecycle-manager.contract";
import {
  createAgentInstance,
  type AgentInstance,
} from "@server/application/ai-agent-sdk/models/agent-sdk.model";

/** Mock agent lifecycle manager — no real agent runtime. */
export class DefaultAgentLifecycleManager implements IAgentLifecycleManager {
  async initialize(instance: AgentInstance): Promise<AgentLifecycleResult> {
    const initialized = createAgentInstance({
      ...instance,
      status: "created",
      mock: true,
      updatedAt: new Date().toISOString(),
    });
    return Object.freeze({ instance: initialized, mock: true });
  }

  async start(instance: AgentInstance): Promise<AgentLifecycleResult> {
    const started = createAgentInstance({
      ...instance,
      status: "running",
      mock: true,
      updatedAt: new Date().toISOString(),
    });
    return Object.freeze({ instance: started, mock: true });
  }

  async stop(instance: AgentInstance): Promise<AgentLifecycleResult> {
    const stopped = createAgentInstance({
      ...instance,
      status: "stopped",
      mock: true,
      updatedAt: new Date().toISOString(),
    });
    return Object.freeze({ instance: stopped, mock: true });
  }
}
