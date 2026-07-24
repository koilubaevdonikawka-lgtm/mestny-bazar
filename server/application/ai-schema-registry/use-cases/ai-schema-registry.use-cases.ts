import type {
  DeleteSchemaResult,
  FindSchemaByNameResult,
  ListSchemasByCategoryResult,
  ListSchemasResult,
  RegisterSchemaInput,
  Schema,
  SchemaRegistryStatistics,
  UpdateSchemaInput,
} from "@server/application/ai-schema-registry/models/schema.model";
import type { AiSchemaRegistryService } from "@server/application/ai-schema-registry/services/ai-schema-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterSchemaUseCase {
  constructor(private readonly schemaRegistry: AiSchemaRegistryService) {}

  execute(input: RegisterSchemaInput): Promise<UseCaseResult<Schema>> {
    return this.schemaRegistry.registerSchema(input).then(useCaseResult);
  }
}

export class GetSchemaUseCase {
  constructor(private readonly schemaRegistry: AiSchemaRegistryService) {}

  execute(schemaId: string): Promise<UseCaseResult<Schema | null>> {
    return this.schemaRegistry.getSchema(schemaId).then(useCaseResult);
  }
}

export class ListSchemasUseCase {
  constructor(private readonly schemaRegistry: AiSchemaRegistryService) {}

  execute(): Promise<UseCaseResult<ListSchemasResult>> {
    return this.schemaRegistry.listSchemas().then(useCaseResult);
  }
}

export class UpdateSchemaUseCase {
  constructor(private readonly schemaRegistry: AiSchemaRegistryService) {}

  execute(input: UpdateSchemaInput): Promise<UseCaseResult<Schema>> {
    return this.schemaRegistry.updateSchema(input).then(useCaseResult);
  }
}

export class DeleteSchemaUseCase {
  constructor(private readonly schemaRegistry: AiSchemaRegistryService) {}

  execute(schemaId: string): Promise<UseCaseResult<DeleteSchemaResult>> {
    return this.schemaRegistry.deleteSchema(schemaId).then(useCaseResult);
  }
}

export class FindSchemaByNameUseCase {
  constructor(private readonly schemaRegistry: AiSchemaRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindSchemaByNameResult>> {
    return this.schemaRegistry.findSchemaByName(name).then(useCaseResult);
  }
}

export class ListSchemasByCategoryUseCase {
  constructor(private readonly schemaRegistry: AiSchemaRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListSchemasByCategoryResult>> {
    return this.schemaRegistry.listSchemasByCategory(category).then(useCaseResult);
  }
}

export class GetSchemaRegistryStatisticsUseCase {
  constructor(private readonly schemaRegistry: AiSchemaRegistryService) {}

  execute(): Promise<UseCaseResult<SchemaRegistryStatistics>> {
    return this.schemaRegistry.getSchemaRegistryStatistics().then(useCaseResult);
  }
}
