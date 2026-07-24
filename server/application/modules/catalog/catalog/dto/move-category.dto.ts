export interface MoveCategoryDto {
  readonly categoryId: string;
  readonly newParentId: string | null;
  readonly sortOrder?: number;
}
