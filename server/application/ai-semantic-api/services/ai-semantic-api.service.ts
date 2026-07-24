/**
 * AI Semantic API — unified semantic API for AI agent interaction.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { ISemanticEndpointRepository } from "@server/application/ai-semantic-api/contracts/semantic-endpoint-repository.contract";
import type { ISemanticRequestHistoryRepository } from "@server/application/ai-semantic-api/contracts/semantic-request-history-repository.contract";
import type { ISemanticRequestProcessor } from "@server/application/ai-semantic-api/contracts/semantic-request-processor.contract";
import type { ISemanticSchemaRegistry } from "@server/application/ai-semantic-api/contracts/semantic-schema-registry.contract";
import type { ISemanticStatisticsProvider } from "@server/application/ai-semantic-api/contracts/semantic-statistics-provider.contract";
import {
  createSemanticEndpoint,
  createSemanticRequestHistoryEntry,
  type DeleteSemanticEndpointResult,
  type GetSemanticRequestHistoryResult,
  type HandleSemanticRequestInput,
  type HandleSemanticRequestResult,
  type ListSemanticEndpointsResult,
  type RegisterSemanticEndpointInput,
  type SemanticApiStatistics,
  type SemanticEndpoint,
  type UpdateSemanticEndpointInput,
} from "@server/application/ai-semantic-api/models/semantic-endpoint.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiSemanticApiService {
  constructor(
    private readonly endpointRepository: ISemanticEndpointRepository,
    private readonly requestProcessor: ISemanticRequestProcessor,
    private readonly schemaRegistry: ISemanticSchemaRegistry,
    private readonly requestHistoryRepository: ISemanticRequestHistoryRepository,
    private readonly statisticsProvider: ISemanticStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerSemanticEndpoint(input: RegisterSemanticEndpointInput): Promise<SemanticEndpoint> {
    const name = input.name.trim();
    const path = input.path.trim();

    if (!name) {
      throw new Error("Semantic endpoint name is required.");
    }
    if (!path) {
      throw new Error("Semantic endpoint path is required.");
    }
    if (await this.endpointRepository.findByName(name)) {
      throw new Error(`Semantic endpoint already exists: ${name}`);
    }
    if (await this.endpointRepository.findByPath(path)) {
      throw new Error(`Semantic endpoint path already exists: ${path}`);
    }

    const endpoint = createSemanticEndpoint({
      endpointId: this.idGenerator.generate(),
      name,
      path,
      description: input.description,
      schema: input.schema,
      status: input.status,
    });

    await this.endpointRepository.save(endpoint);
    await this.schemaRegistry.register(endpoint);
    return endpoint;
  }

  async getSemanticEndpoint(endpointId: string): Promise<SemanticEndpoint | null> {
    return this.endpointRepository.findById(endpointId.trim());
  }

  async listSemanticEndpoints(): Promise<ListSemanticEndpointsResult> {
    const endpoints = Object.freeze(
      [...(await this.endpointRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ endpoints, total: endpoints.length });
  }

  async updateSemanticEndpoint(input: UpdateSemanticEndpointInput): Promise<SemanticEndpoint> {
    const endpointId = input.endpointId.trim();
    const existing = await this.endpointRepository.findById(endpointId);
    if (!existing) {
      throw new Error(`Semantic endpoint not found: ${endpointId}`);
    }

    const nextName = input.name?.trim() ?? existing.name;
    const nextPath = input.path?.trim() ?? existing.path;

    if (nextName !== existing.name && (await this.endpointRepository.findByName(nextName))) {
      throw new Error(`Semantic endpoint already exists: ${nextName}`);
    }
    if (nextPath !== existing.path && (await this.endpointRepository.findByPath(nextPath))) {
      throw new Error(`Semantic endpoint path already exists: ${nextPath}`);
    }

    const updated = createSemanticEndpoint({
      endpointId: existing.endpointId,
      name: nextName,
      path: nextPath,
      description: input.description ?? existing.description,
      schema: input.schema ?? existing.schema,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.endpointRepository.save(updated);
    await this.schemaRegistry.register(updated);
    return updated;
  }

  async deleteSemanticEndpoint(endpointId: string): Promise<DeleteSemanticEndpointResult> {
    const normalizedEndpointId = endpointId.trim();
    const deleted = await this.endpointRepository.delete(normalizedEndpointId);
    if (deleted) {
      await this.schemaRegistry.remove(normalizedEndpointId);
    }
    return Object.freeze({ endpointId: normalizedEndpointId, deleted });
  }

  async handleSemanticRequest(input: HandleSemanticRequestInput): Promise<HandleSemanticRequestResult> {
    const endpoint = await this.resolveEndpoint(input);
    const processed = await this.requestProcessor.process(input, endpoint);
    await this.statisticsProvider.recordRequest();

    const requestId = this.idGenerator.generate();
    const requestInput = Object.freeze({
      endpointId: input.endpointId ?? null,
      intent: input.intent?.trim() ?? null,
      payload: input.payload ?? null,
    });

    await this.requestHistoryRepository.save(
      createSemanticRequestHistoryEntry({
        requestId,
        endpointId: endpoint?.endpointId ?? null,
        intent: input.intent?.trim() ?? null,
        input: requestInput,
        response: processed.response,
        mock: processed.mock,
      }),
    );

    return Object.freeze({
      requestId,
      endpointId: endpoint?.endpointId ?? null,
      intent: input.intent?.trim() ?? null,
      response: processed.response,
      mock: processed.mock,
    });
  }

  async getSemanticRequestHistory(): Promise<GetSemanticRequestHistoryResult> {
    const entries = Object.freeze([...(await this.requestHistoryRepository.findAll())]);
    return Object.freeze({ entries, total: entries.length });
  }

  async getSemanticApiStatistics(): Promise<SemanticApiStatistics> {
    const endpoints = await this.endpointRepository.findAll();
    const activeEndpoints = endpoints.filter((endpoint) => endpoint.status === "active").length;

    return this.statisticsProvider.getStatistics({
      totalEndpoints: endpoints.length,
      activeEndpoints,
    });
  }

  private async resolveEndpoint(
    input: HandleSemanticRequestInput,
  ): Promise<SemanticEndpoint | null> {
    if (input.endpointId?.trim()) {
      const endpoint = await this.endpointRepository.findById(input.endpointId.trim());
      if (!endpoint) {
        throw new Error(`Semantic endpoint not found: ${input.endpointId}`);
      }
      return endpoint;
    }

    const intent = input.intent?.trim();
    if (intent) {
      const byName = await this.endpointRepository.findByName(intent);
      if (byName) {
        return byName;
      }
      const byPath = await this.endpointRepository.findByPath(intent);
      if (byPath) {
        return byPath;
      }
    }

    return null;
  }
}
