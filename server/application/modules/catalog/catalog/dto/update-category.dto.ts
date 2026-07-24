export interface UpdateCategoryDto {
  readonly categoryId: string;
  readonly name: string;
  readonly slug?: string;
  readonly description?: string | null;
  readonly sortOrder?: number;
}
