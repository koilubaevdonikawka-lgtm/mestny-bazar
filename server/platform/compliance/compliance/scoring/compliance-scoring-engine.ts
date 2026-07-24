import type { IComplianceScoringEngine } from "@server/platform/compliance/compliance/contracts";
import {
  createComplianceScore,
  type ComplianceAssessment,
  type ComplianceScore,
  type ComplianceStandard,
} from "@server/platform/compliance/compliance/models";
import { createComplianceScoreCalculatedEvent } from "@server/platform/compliance/compliance/events";

/** Calculates compliance scores as metadata only. */
export class ComplianceScoringEngine implements IComplianceScoringEngine {
  calculate(
    standards: readonly ComplianceStandard[],
    assessments: readonly ComplianceAssessment[],
  ): ComplianceScore {
    const totalWeight = standards.reduce((sum, standard) => sum + standard.weight, 0) || 1;
    const weightedSum = assessments.reduce((sum, assessment) => {
      const standard = standards.find((entry) => entry.id === assessment.standardId);
      const weight = standard?.weight ?? 1;
      return sum + assessment.score * weight;
    }, 0);
    const weightedScore = Math.round(weightedSum / totalWeight);
    const overallScore =
      assessments.length === 0
        ? 0
        : Math.round(
            assessments.reduce((sum, assessment) => sum + assessment.score, 0) /
              assessments.length,
          );
    const passedCount = assessments.filter((assessment) => assessment.passed).length;
    const categoryScore =
      assessments.length === 0 ? 0 : Math.round((passedCount / assessments.length) * 100);
    const readinessScore = Math.round((weightedScore + categoryScore + overallScore) / 3);

    const breakdown = Object.freeze(
      standards.reduce<Record<string, number>>((accumulator, standard) => {
        const assessment = assessments.find((entry) => entry.standardId === standard.id);
        accumulator[standard.category] = assessment?.score ?? 0;
        return accumulator;
      }, {}),
    );

    const score = createComplianceScore({
      categoryScore,
      overallScore,
      weightedScore,
      readinessScore,
      breakdown,
    });
    createComplianceScoreCalculatedEvent(score);
    return score;
  }

  readinessScore(score: ComplianceScore): number {
    return score.readinessScore;
  }
}
