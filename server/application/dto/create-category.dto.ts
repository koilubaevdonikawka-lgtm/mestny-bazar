export interface CreateCategoryHierarchyDto {
  existingPaths: string[];
  ancestorIds: string[];
  maxDepth?: number;
}

export interface CreateCategoryDto {
  catalogId: string;
  name: string;
  slug?: string;
  parentId?: string | null;
  parentPath?: {
    value: string;
    segments: string[];
    depth: number;
  } | null;
  sortOrder?: number;
  seo?: {
    title?: string | null;
    description?: string | null;
    keywords?: string[];
  };
  metadata?: Record<string, string>;
  hierarchy: CreateCategoryHierarchyDto;
}
