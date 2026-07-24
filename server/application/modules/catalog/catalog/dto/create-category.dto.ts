export interface CreateCategoryDto {
  readonly catalogId: string;
  readonly name: string;
  readonly slug?: string;
  readonly description?: string | null;
  readonly parentId?: string | null;
  readonly sortOrder?: number;
}
