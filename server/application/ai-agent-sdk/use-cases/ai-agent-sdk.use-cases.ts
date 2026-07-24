import type {
  AgentInstance,
  AgentSdk,
  AgentSdkStatistics,
  CreateAgentInstanceInput,
  DeleteAgentSdkResult,
  ListAgentInstancesResult,
  ListAgentSdksResult,
  RegisterAgentSdkInput,
  UpdateAgentSdkInput,
} from "@server/application/ai-agent-sdk/models/agent-sdk.model";
import type { AiAgentSdkService } from "@server/application/ai-agent-sdk/services/ai-agent-sdk.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterAgentSdkUseCase {
  constructor(private readonly agentSdk: AiAgentSdkService) {}

  execute(input: RegisterAgentSdkInput): Promise<UseCaseResult<AgentSdk>> {
    return this.agentSdk.registerAgentSdk(input).then(useCaseResult);
  }
}

export class GetAgentSdkUseCase {
  constructor(private readonly agentSdk: AiAgentSdkService) {}

  execute(sdkId: string): Promise<UseCaseResult<AgentSdk | null>> {
    return this.agentSdk.getAgentSdk(sdkId).then(useCaseResult);
  }
}

export class ListAgentSdksUseCase {
  constructor(private readonly agentSdk: AiAgentSdkService) {}

  execute(): Promise<UseCaseResult<ListAgentSdksResult>> {
    return this.agentSdk.listAgentSdks().then(useCaseResult);
  }
}

export class UpdateAgentSdkUseCase {
  constructor(private readonly agentSdk: AiAgentSdkService) {}

  execute(input: UpdateAgentSdkInput): Promise<UseCaseResult<AgentSdk>> {
    return this.agentSdk.updateAgentSdk(input).then(useCaseResult);
  }
}

export class DeleteAgentSdkUseCase {
  constructor(private readonly agentSdk: AiAgentSdkService) {}

  execute(sdkId: string): Promise<UseCaseResult<DeleteAgentSdkResult>> {
    return this.agentSdk.deleteAgentSdk(sdkId).then(useCaseResult);
  }
}

export class CreateAgentInstanceUseCase {
  constructor(private readonly agentSdk: AiAgentSdkService) {}

  execute(input: CreateAgentInstanceInput): Promise<UseCaseResult<AgentInstance>> {
    return this.agentSdk.createAgentInstance(input).then(useCaseResult);
  }
}

export class ListAgentInstancesUseCase {
  constructor(private readonly agentSdk: AiAgentSdkService) {}

  execute(): Promise<UseCaseResult<ListAgentInstancesResult>> {
    return this.agentSdk.listAgentInstances().then(useCaseResult);
  }
}

export class GetAgentSdkStatisticsUseCase {
  constructor(private readonly agentSdk: AiAgentSdkService) {}

  execute(): Promise<UseCaseResult<AgentSdkStatistics>> {
    return this.agentSdk.getAgentSdkStatistics().then(useCaseResult);
  }
}
