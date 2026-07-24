export interface MediaAssetInput {
  id: string;
  url: string;
  hash?: string;
  width?: number;
  height?: number;
  fileSizeBytes?: number;
}

export interface ResolvedMediaAsset {
  id: string;
  url: string;
  hash: string;
  width: number | null;
  height: number | null;
  fileSizeBytes: number | null;
  aspectRatio: number | null;
}

export interface MediaQualityRules {
  minPhotos: number;
  maxPhotos: number;
  minWidth: number;
  minHeight: number;
  maxFileSizeBytes: number;
  minAspectRatio: number;
  maxAspectRatio: number;
}

export interface MediaPhotoAnalysis {
  id: string;
  url: string;
  hash: string;
  width: number | null;
  height: number | null;
  fileSizeBytes: number | null;
  aspectRatio: number | null;
  issues: string[];
}

export interface MediaAnalysisChecks {
  photoCount: { passed: boolean; actual: number; min: number; max: number };
  resolution: { passed: boolean; violations: number };
  fileSize: { passed: boolean; violations: number };
  aspectRatio: { passed: boolean; violations: number };
  duplicates: { passed: boolean; duplicateCount: number };
}

export interface MediaAnalysisResult {
  productId: string | null;
  photoCount: number;
  minPhotos: number;
  maxPhotos: number;
  photos: MediaPhotoAnalysis[];
  duplicateGroups: string[][];
  mediaScore: number;
  checks: MediaAnalysisChecks;
}

export interface IMediaMetadataService {
  resolveAssets(inputs: MediaAssetInput[]): Promise<ResolvedMediaAsset[]>;
}

export interface IMediaQualityAnalyzer {
  analyze(input: {
    productId: string | null;
    assets: ResolvedMediaAsset[];
    rules?: Partial<MediaQualityRules>;
  }): MediaAnalysisResult;
}

export const DEFAULT_MEDIA_QUALITY_RULES: MediaQualityRules = {
  minPhotos: 1,
  maxPhotos: 10,
  minWidth: 800,
  minHeight: 800,
  maxFileSizeBytes: 5 * 1024 * 1024,
  minAspectRatio: 0.75,
  maxAspectRatio: 1.33,
};
