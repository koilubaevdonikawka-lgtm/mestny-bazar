import type { Model } from "@server/application/ai-model-registry/models/model.model";

/** Future integration point for model deployment. Not wired yet. */
export interface IModelDeploymentProvider {
  deploy(model: Model): Promise<{ deploymentId: string }>;
  undeploy(deploymentId: string): Promise<boolean>;
}
