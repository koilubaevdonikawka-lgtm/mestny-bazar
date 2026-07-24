import type { ArchitectureRecommendation } from "@server/platform/architecture-intelligence/architecture-intelligence/models";

/** Contract for architecture recommendation generation (metadata only). */
export interface IRecommendationEngine {
  generate(risks?: readonly import("../models").ArchitectureRisk[]): readonly ArchitectureRecommendation[];
}
