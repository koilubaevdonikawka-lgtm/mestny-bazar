import type {
  IMediaQualityAnalyzer,
  MediaAnalysisResult,
  MediaPhotoAnalysis,
  MediaQualityRules,
  ResolvedMediaAsset,
} from "@server/ports/marketplace-ai/media-analysis.port";
import { DEFAULT_MEDIA_QUALITY_RULES } from "@server/ports/marketplace-ai/media-analysis.port";

/** Rule-based media scoring — analysis only, no publication decisions. */
export class MediaQualityAnalyzerService implements IMediaQualityAnalyzer {
  analyze(input: {
    productId: string | null;
    assets: ResolvedMediaAsset[];
    rules?: Partial<MediaQualityRules>;
  }): MediaAnalysisResult {
    const rules: MediaQualityRules = { ...DEFAULT_MEDIA_QUALITY_RULES, ...input.rules };
    const photos = input.assets.map((asset) => this.analyzePhoto(asset, rules));
    const duplicateGroups = this.findDuplicateGroups(input.assets);
    const duplicateCount = duplicateGroups.reduce((sum, group) => sum + group.length - 1, 0);

    const photoCountPassed =
      photos.length >= rules.minPhotos && photos.length <= rules.maxPhotos;
    const resolutionViolations = photos.filter((photo) =>
      photo.issues.some((issue) => issue.startsWith("resolution:")),
    ).length;
    const fileSizeViolations = photos.filter((photo) =>
      photo.issues.some((issue) => issue.startsWith("file-size:")),
    ).length;
    const aspectRatioViolations = photos.filter((photo) =>
      photo.issues.some((issue) => issue.startsWith("aspect-ratio:")),
    ).length;

    const checks = {
      photoCount: {
        passed: photoCountPassed,
        actual: photos.length,
        min: rules.minPhotos,
        max: rules.maxPhotos,
      },
      resolution: {
        passed: resolutionViolations === 0,
        violations: resolutionViolations,
      },
      fileSize: {
        passed: fileSizeViolations === 0,
        violations: fileSizeViolations,
      },
      aspectRatio: {
        passed: aspectRatioViolations === 0,
        violations: aspectRatioViolations,
      },
      duplicates: {
        passed: duplicateCount === 0,
        duplicateCount,
      },
    };

    return {
      productId: input.productId,
      photoCount: photos.length,
      minPhotos: rules.minPhotos,
      maxPhotos: rules.maxPhotos,
      photos,
      duplicateGroups,
      mediaScore: this.calculateMediaScore(checks),
      checks,
    };
  }

  private analyzePhoto(asset: ResolvedMediaAsset, rules: MediaQualityRules): MediaPhotoAnalysis {
    const issues: string[] = [];

    if (asset.width === null || asset.height === null) {
      issues.push("resolution:unknown");
    } else if (asset.width < rules.minWidth || asset.height < rules.minHeight) {
      issues.push(`resolution:below-minimum(${asset.width}x${asset.height})`);
    }

    if (asset.fileSizeBytes === null) {
      issues.push("file-size:unknown");
    } else if (asset.fileSizeBytes > rules.maxFileSizeBytes) {
      issues.push(`file-size:above-maximum(${asset.fileSizeBytes})`);
    }

    if (asset.aspectRatio === null) {
      issues.push("aspect-ratio:unknown");
    } else if (
      asset.aspectRatio < rules.minAspectRatio ||
      asset.aspectRatio > rules.maxAspectRatio
    ) {
      issues.push(`aspect-ratio:out-of-range(${asset.aspectRatio})`);
    }

    return {
      id: asset.id,
      url: asset.url,
      hash: asset.hash,
      width: asset.width,
      height: asset.height,
      fileSizeBytes: asset.fileSizeBytes,
      aspectRatio: asset.aspectRatio,
      issues,
    };
  }

  private findDuplicateGroups(assets: ResolvedMediaAsset[]): string[][] {
    const byHash = new Map<string, string[]>();

    for (const asset of assets) {
      const bucket = byHash.get(asset.hash) ?? [];
      bucket.push(asset.id);
      byHash.set(asset.hash, bucket);
    }

    return [...byHash.values()].filter((group) => group.length > 1);
  }

  private calculateMediaScore(checks: MediaAnalysisResult["checks"]): number {
    let score = 100;

    if (!checks.photoCount.passed) {
      if (checks.photoCount.actual < checks.photoCount.min) {
        score -= 30;
      }
      if (checks.photoCount.actual > checks.photoCount.max) {
        score -= 10;
      }
    }

    score -= checks.resolution.violations * 15;
    score -= checks.fileSize.violations * 10;
    score -= checks.aspectRatio.violations * 10;
    score -= checks.duplicates.duplicateCount * 20;

    return Math.max(0, Math.min(100, score));
  }
}
