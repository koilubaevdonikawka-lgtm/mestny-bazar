import type {
  RegisterSchemaInput,
  UpdateSchemaInput,
} from "@server/application/ai-schema-registry/models/schema.model";
import {
  DeleteSchemaUseCase,
  FindSchemaByNameUseCase,
  GetSchemaRegistryStatisticsUseCase,
  GetSchemaUseCase,
  ListSchemasByCategoryUseCase,
  ListSchemasUseCase,
  RegisterSchemaUseCase,
  UpdateSchemaUseCase,
} from "@server/application/ai-schema-registry/use-cases/ai-schema-registry.use-cases";

/** Application facade for AI Schema Registry scenario. */
export class AiSchemaRegistryApplicationService {
  constructor(
    private readonly registerSchemaUseCase: RegisterSchemaUseCase,
    private readonly getSchemaUseCase: GetSchemaUseCase,
    private readonly listSchemasUseCase: ListSchemasUseCase,
    private readonly updateSchemaUseCase: UpdateSchemaUseCase,
    private readonly deleteSchemaUseCase: DeleteSchemaUseCase,
    private readonly findSchemaByNameUseCase: FindSchemaByNameUseCase,
    private readonly listSchemasByCategoryUseCase: ListSchemasByCategoryUseCase,
    private readonly getSchemaRegistryStatisticsUseCase: GetSchemaRegistryStatisticsUseCase,
  ) {}

  registerSchema(input: RegisterSchemaInput) {
    return this.registerSchemaUseCase.execute(input);
  }

  getSchema(schemaId: string) {
    return this.getSchemaUseCase.execute(schemaId);
  }

  listSchemas() {
    return this.listSchemasUseCase.execute();
  }

  updateSchema(input: UpdateSchemaInput) {
    return this.updateSchemaUseCase.execute(input);
  }

  deleteSchema(schemaId: string) {
    return this.deleteSchemaUseCase.execute(schemaId);
  }

  findSchemaByName(name: string) {
    return this.findSchemaByNameUseCase.execute(name);
  }

  listSchemasByCategory(category: string) {
    return this.listSchemasByCategoryUseCase.execute(category);
  }

  getSchemaRegistryStatistics() {
    return this.getSchemaRegistryStatisticsUseCase.execute();
  }
}
