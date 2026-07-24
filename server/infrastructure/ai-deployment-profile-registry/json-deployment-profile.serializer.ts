import type { IDeploymentProfileSerializer } from "@server/application/ai-deployment-profile-registry/contracts/deployment-profile-serializer.contract";
import {
  createDeploymentProfile,
  type DeploymentProfile,
} from "@server/application/ai-deployment-profile-registry/models/deployment-profile.model";

/** JSON-based deployment profile serializer. */
export class JsonDeploymentProfileSerializer implements IDeploymentProfileSerializer {
  async serialize(deploymentProfile: DeploymentProfile): Promise<string> {
    return JSON.stringify(deploymentProfile);
  }

  async deserialize(serialized: string): Promise<DeploymentProfile> {
    if (!serialized.trim()) {
      throw new Error("Serialized deployment profile cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<DeploymentProfile>;
    return createDeploymentProfile({
      deploymentProfileId: parsed.deploymentProfileId ?? "",
      name: parsed.name ?? "",
      category: parsed.category ?? "",
      description: parsed.description,
      version: parsed.version,
      status: parsed.status,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
    });
  }
}
