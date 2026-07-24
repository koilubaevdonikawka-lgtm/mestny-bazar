/**
 * AI Memory Management — unified memory management for AI agents.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IMemoryCatalog } from "@server/application/ai-memory-management/contracts/memory-catalog.contract";
import type { IMemoryRepository } from "@server/application/ai-memory-management/contracts/memory-repository.contract";
import type { IMemorySerializer } from "@server/application/ai-memory-management/contracts/memory-serializer.contract";
import type { IMemoryStatisticsProvider } from "@server/application/ai-memory-management/contracts/memory-statistics-provider.contract";
import type { IMemoryValidator } from "@server/application/ai-memory-management/contracts/memory-validator.contract";
import {
  createMemoryRecord,
  type DeleteMemoryRecordResult,
  type FindMemoryRecordsByKeyResult,
  type ListMemoryRecordsByCategoryResult,
  type ListMemoryRecordsResult,
  type MemoryRecord,
  type MemoryStatistics,
  type RegisterMemoryRecordInput,
  type UpdateMemoryRecordInput,
} from "@server/application/ai-memory-management/models/memory-record.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiMemoryManagementService {
  constructor(
    private readonly memoryRepository: IMemoryRepository,
    private readonly memoryCatalog: IMemoryCatalog,
    private readonly memoryValidator: IMemoryValidator,
    private readonly memorySerializer: IMemorySerializer,
    private readonly statisticsProvider: IMemoryStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerMemoryRecord(input: RegisterMemoryRecordInput): Promise<MemoryRecord> {
    const validation = await this.memoryValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const record = createMemoryRecord({
      memoryId: this.idGenerator.generate(),
      key: input.key.trim(),
      category: input.category.trim(),
      description: input.description,
      data: input.data,
      status: input.status,
    });

    await this.memoryRepository.save(record);
    await this.memoryCatalog.register(record);
    return record;
  }

  async getMemoryRecord(memoryId: string): Promise<MemoryRecord | null> {
    return this.memoryRepository.findById(memoryId.trim());
  }

  async listMemoryRecords(): Promise<ListMemoryRecordsResult> {
    const records = Object.freeze(
      [...(await this.memoryRepository.findAll())].sort((left, right) =>
        left.key.localeCompare(right.key),
      ),
    );
    return Object.freeze({ records, total: records.length });
  }

  async updateMemoryRecord(input: UpdateMemoryRecordInput): Promise<MemoryRecord> {
    const memoryId = input.memoryId.trim();
    const existing = await this.memoryRepository.findById(memoryId);
    if (!existing) {
      throw new Error(`Memory record not found: ${memoryId}`);
    }

    const validation = await this.memoryValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const updated = createMemoryRecord({
      memoryId: existing.memoryId,
      key: input.key?.trim() ?? existing.key,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      data: input.data ?? existing.data,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.memoryRepository.save(updated);
    await this.memoryCatalog.register(updated);
    return updated;
  }

  async deleteMemoryRecord(memoryId: string): Promise<DeleteMemoryRecordResult> {
    const normalizedMemoryId = memoryId.trim();
    const deleted = await this.memoryRepository.delete(normalizedMemoryId);
    if (deleted) {
      await this.memoryCatalog.remove(normalizedMemoryId);
    }
    return Object.freeze({ memoryId: normalizedMemoryId, deleted });
  }

  async findMemoryRecordsByKey(key: string): Promise<FindMemoryRecordsByKeyResult> {
    const normalizedKey = key.trim();
    const records = Object.freeze(
      [...(await this.memoryRepository.findByKey(normalizedKey))].sort((left, right) =>
        left.createdAt.localeCompare(right.createdAt),
      ),
    );
    return Object.freeze({ records, total: records.length, key: normalizedKey });
  }

  async listMemoryRecordsByCategory(
    category: string,
  ): Promise<ListMemoryRecordsByCategoryResult> {
    const normalizedCategory = category.trim();
    const records = Object.freeze(
      [...(await this.memoryRepository.findByCategory(normalizedCategory))].sort((left, right) =>
        left.key.localeCompare(right.key),
      ),
    );
    return Object.freeze({
      records,
      total: records.length,
      category: normalizedCategory,
    });
  }

  async getMemoryStatistics(): Promise<MemoryStatistics> {
    const records = await this.memoryRepository.findAll();
    const activeRecords = records.filter((record) => record.status === "active").length;
    const categories = Object.freeze([
      ...new Set(records.map((record) => record.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalRecords: records.length,
      activeRecords,
      categories,
    });
  }

  async serializeMemory(data: unknown): Promise<string> {
    return this.memorySerializer.serialize(data);
  }

  async deserializeMemory(serialized: string): Promise<unknown> {
    return this.memorySerializer.deserialize(serialized);
  }
}
