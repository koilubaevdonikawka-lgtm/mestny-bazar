import type {
  CreateAgentInstanceInput,
  RegisterAgentSdkInput,
  UpdateAgentSdkInput,
} from "@server/application/ai-agent-sdk/models/agent-sdk.model";
import {
  CreateAgentInstanceUseCase,
  DeleteAgentSdkUseCase,
  GetAgentSdkStatisticsUseCase,
  GetAgentSdkUseCase,
  ListAgentInstancesUseCase,
  ListAgentSdksUseCase,
  RegisterAgentSdkUseCase,
  UpdateAgentSdkUseCase,
} from "@server/application/ai-agent-sdk/use-cases/ai-agent-sdk.use-cases";

/** Application facade for AI Agent SDK scenario. */
export class AiAgentSdkApplicationService {
  constructor(
    private readonly registerAgentSdkUseCase: RegisterAgentSdkUseCase,
    private readonly getAgentSdkUseCase: GetAgentSdkUseCase,
    private readonly listAgentSdksUseCase: ListAgentSdksUseCase,
    private readonly updateAgentSdkUseCase: UpdateAgentSdkUseCase,
    private readonly deleteAgentSdkUseCase: DeleteAgentSdkUseCase,
    private readonly createAgentInstanceUseCase: CreateAgentInstanceUseCase,
    private readonly listAgentInstancesUseCase: ListAgentInstancesUseCase,
    private readonly getAgentSdkStatisticsUseCase: GetAgentSdkStatisticsUseCase,
  ) {}

  registerAgentSdk(input: RegisterAgentSdkInput) {
    return this.registerAgentSdkUseCase.execute(input);
  }

  getAgentSdk(sdkId: string) {
    return this.getAgentSdkUseCase.execute(sdkId);
  }

  listAgentSdks() {
    return this.listAgentSdksUseCase.execute();
  }

  updateAgentSdk(input: UpdateAgentSdkInput) {
    return this.updateAgentSdkUseCase.execute(input);
  }

  deleteAgentSdk(sdkId: string) {
    return this.deleteAgentSdkUseCase.execute(sdkId);
  }

  createAgentInstance(input: CreateAgentInstanceInput) {
    return this.createAgentInstanceUseCase.execute(input);
  }

  listAgentInstances() {
    return this.listAgentInstancesUseCase.execute();
  }

  getAgentSdkStatistics() {
    return this.getAgentSdkStatisticsUseCase.execute();
  }
}
