import { ApiNotFoundError, ApiValidationError } from "@server/api/errors/api.errors";
import type { IStorageProvider } from "@server/infrastructure/storage/files";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/integration/routing/integration-controller.helpers";

/** Storage HTTP controller — delegates file operations to the storage port. */
export class StorageController {
  constructor(private readonly storage: IStorageProvider) {}

  async upload(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const key = readString(body.key);
    const contentBase64 = readString(body.contentBase64);

    if (!key) {
      throw new ApiValidationError({ key: ["key is required"] });
    }
    if (!contentBase64) {
      throw new ApiValidationError({ contentBase64: ["contentBase64 is required"] });
    }

    const content = Buffer.from(contentBase64, "base64");
    const contentType = readString(body.contentType) ?? "application/octet-stream";
    const metadata = readMetadata(body.metadata);

    const response = await this.storage.uploadFile({
      path: key,
      content,
      contentType,
      metadata,
      overwrite: body.overwrite === true,
    });

    return createJsonResponse(context, response, 201);
  }

  async download(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const key = decodeStorageKey(context);
    const exists = await this.storage.exists(key);
    if (!exists) {
      throw new ApiNotFoundError("StorageObject");
    }

    const file = await this.storage.downloadFile(key);
    return createJsonResponse(context, {
      key,
      contentType: file.contentType,
      size: file.size,
      contentBase64: Buffer.from(file.data).toString("base64"),
    });
  }

  async delete(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const key = decodeStorageKey(context);
    const exists = await this.storage.exists(key);
    if (!exists) {
      throw new ApiNotFoundError("StorageObject");
    }

    await this.storage.deleteFile(key);
    return createJsonResponse(context, { key, deleted: true });
  }
}

function decodeStorageKey(context: ApiRequestContext): string {
  const queryKey = context.query.key;
  const key =
    context.params.key ??
    (Array.isArray(queryKey) ? queryKey[0] : typeof queryKey === "string" ? queryKey : undefined);
  if (!key?.trim()) {
    throw new ApiValidationError({ key: ["Storage key is required"] });
  }
  return decodeURIComponent(key);
}

function readMetadata(value: unknown): Readonly<Record<string, string>> | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }

  const metadata: Record<string, string> = {};
  for (const [entryKey, entryValue] of Object.entries(value)) {
    if (entryValue !== undefined && entryValue !== null) {
      metadata[entryKey] = String(entryValue);
    }
  }

  return Object.keys(metadata).length > 0 ? Object.freeze(metadata) : undefined;
}
