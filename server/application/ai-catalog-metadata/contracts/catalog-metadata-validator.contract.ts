import type {
  CatalogMetadata,
  RegisterCatalogMetadataInput,
  UpdateCatalogMetadataInput,
} from "@server/application/ai-catalog-metadata/models/catalog-metadata.model";

export interface CatalogMetadataValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface ICatalogMetadataValidator {
  validateRegistration(input: RegisterCatalogMetadataInput): Promise<CatalogMetadataValidationResult>;
  validateUpdate(
    existing: CatalogMetadata,
    input: UpdateCatalogMetadataInput,
  ): Promise<CatalogMetadataValidationResult>;
}
