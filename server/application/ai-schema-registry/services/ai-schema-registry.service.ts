/**
 * AI Schema Registry — unified registry for AI schemas.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { ISchemaCatalog } from "@server/application/ai-schema-registry/contracts/schema-catalog.contract";
import type { ISchemaRepository } from "@server/application/ai-schema-registry/contracts/schema-repository.contract";
import type { ISchemaSerializer } from "@server/application/ai-schema-registry/contracts/schema-serializer.contract";
import type { ISchemaStatisticsProvider } from "@server/application/ai-schema-registry/contracts/schema-statistics-provider.contract";
import type { ISchemaValidator } from "@server/application/ai-schema-registry/contracts/schema-validator.contract";
import {
  createSchema,
  type DeleteSchemaResult,
  type FindSchemaByNameResult,
  type ListSchemasByCategoryResult,
  type ListSchemasResult,
  type RegisterSchemaInput,
  type Schema,
  type SchemaRegistryStatistics,
  type UpdateSchemaInput,
} from "@server/application/ai-schema-registry/models/schema.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiSchemaRegistryService {
  constructor(
    private readonly schemaRepository: ISchemaRepository,
    private readonly schemaCatalog: ISchemaCatalog,
    private readonly schemaValidator: ISchemaValidator,
    private readonly schemaSerializer: ISchemaSerializer,
    private readonly statisticsProvider: ISchemaStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerSchema(input: RegisterSchemaInput): Promise<Schema> {
    const validation = await this.schemaValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.schemaRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Schema already exists with name: ${input.name.trim()}`);
    }

    const schema = createSchema({
      schemaId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.schemaRepository.save(schema);
    await this.schemaCatalog.register(schema);
    return schema;
  }

  async getSchema(schemaId: string): Promise<Schema | null> {
    return this.schemaRepository.findById(schemaId.trim());
  }

  async listSchemas(): Promise<ListSchemasResult> {
    const schemas = Object.freeze(
      [...(await this.schemaRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ schemas, total: schemas.length });
  }

  async updateSchema(input: UpdateSchemaInput): Promise<Schema> {
    const schemaId = input.schemaId.trim();
    const existing = await this.schemaRepository.findById(schemaId);
    if (!existing) {
      throw new Error(`Schema not found: ${schemaId}`);
    }

    const validation = await this.schemaValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.schemaRepository.findByName(input.name.trim());
      if (duplicate && duplicate.schemaId !== existing.schemaId) {
        throw new Error(`Schema already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createSchema({
      schemaId: existing.schemaId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.schemaRepository.save(updated);
    await this.schemaCatalog.register(updated);
    return updated;
  }

  async deleteSchema(schemaId: string): Promise<DeleteSchemaResult> {
    const normalizedSchemaId = schemaId.trim();
    const deleted = await this.schemaRepository.delete(normalizedSchemaId);
    if (deleted) {
      await this.schemaCatalog.remove(normalizedSchemaId);
    }
    return Object.freeze({ schemaId: normalizedSchemaId, deleted });
  }

  async findSchemaByName(name: string): Promise<FindSchemaByNameResult> {
    const normalizedName = name.trim();
    const schema = await this.schemaRepository.findByName(normalizedName);
    return Object.freeze({ schema });
  }

  async listSchemasByCategory(category: string): Promise<ListSchemasByCategoryResult> {
    const normalizedCategory = category.trim();
    const schemas = Object.freeze(
      [...(await this.schemaRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      schemas,
      total: schemas.length,
      category: normalizedCategory,
    });
  }

  async getSchemaRegistryStatistics(): Promise<SchemaRegistryStatistics> {
    const schemas = await this.schemaRepository.findAll();
    const activeSchemas = schemas.filter((schema) => schema.status === "active").length;
    const categories = Object.freeze([
      ...new Set(schemas.map((schema) => schema.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalSchemas: schemas.length,
      activeSchemas,
      categories,
    });
  }

  async serializeSchema(schema: Schema): Promise<string> {
    return this.schemaSerializer.serialize(schema);
  }

  async deserializeSchema(serialized: string): Promise<Schema> {
    return this.schemaSerializer.deserialize(serialized);
  }
}
