import type {
  CatalogMetadataValidationResult,
  ICatalogMetadataValidator,
} from "@server/application/ai-catalog-metadata/contracts/catalog-metadata-validator.contract";
import type {
  CatalogMetadata,
  RegisterCatalogMetadataInput,
  UpdateCatalogMetadataInput,
} from "@server/application/ai-catalog-metadata/models/catalog-metadata.model";

/** Default catalog metadata validator. */
export class DefaultCatalogMetadataValidator implements ICatalogMetadataValidator {
  async validateRegistration(
    input: RegisterCatalogMetadataInput,
  ): Promise<CatalogMetadataValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Catalog metadata name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Catalog metadata category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Catalog metadata status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: CatalogMetadata,
    input: UpdateCatalogMetadataInput,
  ): Promise<CatalogMetadataValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Catalog metadata name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Catalog metadata category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Catalog metadata status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Catalog metadata entry is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
