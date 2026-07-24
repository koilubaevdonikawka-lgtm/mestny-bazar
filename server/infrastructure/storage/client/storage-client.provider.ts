import { mkdir, readFile, writeFile, unlink, rename, copyFile, stat, access } from "node:fs/promises";
import path from "node:path";
import type { IStorageClientProvider } from "@server/infrastructure/storage/client/i-storage-client-provider";
import type { StorageConfiguration } from "@server/infrastructure/storage/configuration";
import {
  StorageInfrastructureError,
  StorageObjectNotFoundError,
  type StorageClientCopyOptions,
  type StorageClientMoveOptions,
  type StorageClientUploadOptions,
  type StorageHealthProbeResult,
  type StorageObjectMetadata,
  type StorageObjectPayload,
} from "@server/infrastructure/storage/shared";

/** Encapsulates file storage client operations for local and remote backends. */
export class StorageClientProvider implements IStorageClientProvider {
  constructor(private readonly configuration: StorageConfiguration) {
    Object.freeze(this);
  }

  async uploadObject(options: StorageClientUploadOptions): Promise<StorageObjectMetadata> {
    if (this.configuration.provider === "supabase") {
      return this.uploadSupabaseObject(options);
    }
    return this.uploadLocalObject(options);
  }

  async downloadObject(key: string): Promise<StorageObjectPayload> {
    if (this.configuration.provider === "supabase") {
      return this.downloadSupabaseObject(key);
    }
    return this.downloadLocalObject(key);
  }

  async deleteObject(key: string): Promise<void> {
    if (this.configuration.provider === "supabase") {
      await this.requestSupabase("DELETE", `/storage/v1/object/${encodeObjectPath(key)}`);
      return;
    }
    await unlink(this.resolveLocalPath(key));
  }

  async moveObject(options: StorageClientMoveOptions): Promise<StorageObjectMetadata> {
    if (this.configuration.provider === "supabase") {
      await this.requestSupabase("POST", "/storage/v1/object/move", {
        bucketId: this.configuration.bucket,
        sourceKey: normalizeKey(options.sourceKey),
        destinationKey: normalizeKey(options.destinationKey),
        destinationBucket: this.configuration.bucket,
      });
      return (await this.getObjectMetadata(options.destinationKey)) ?? {
        key: options.destinationKey,
        size: 0,
        contentType: "application/octet-stream",
      };
    }

    const source = this.resolveLocalPath(options.sourceKey);
    const destination = this.resolveLocalPath(options.destinationKey);
    await mkdir(path.dirname(destination), { recursive: true });
    await rename(source, destination);
    return this.buildLocalMetadata(options.destinationKey);
  }

  async copyObject(options: StorageClientCopyOptions): Promise<StorageObjectMetadata> {
    if (this.configuration.provider === "supabase") {
      await this.requestSupabase("POST", "/storage/v1/object/copy", {
        bucketId: this.configuration.bucket,
        sourceKey: normalizeKey(options.sourceKey),
        destinationKey: normalizeKey(options.destinationKey),
        destinationBucket: this.configuration.bucket,
      });
      return (await this.getObjectMetadata(options.destinationKey)) ?? {
        key: options.destinationKey,
        size: 0,
        contentType: "application/octet-stream",
      };
    }

    const source = this.resolveLocalPath(options.sourceKey);
    const destination = this.resolveLocalPath(options.destinationKey);
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(source, destination);
    return this.buildLocalMetadata(options.destinationKey);
  }

  async objectExists(key: string): Promise<boolean> {
    if (this.configuration.provider === "supabase") {
      const metadata = await this.getObjectMetadata(key);
      return metadata !== null;
    }

    try {
      await access(this.resolveLocalPath(key));
      return true;
    } catch {
      return false;
    }
  }

  async getObjectMetadata(key: string): Promise<StorageObjectMetadata | null> {
    if (this.configuration.provider === "supabase") {
      try {
        const response = await this.requestSupabase(
          "POST",
          `/storage/v1/object/list/${this.configuration.bucket}`,
          { prefix: normalizeKey(key), limit: 1, search: normalizeKey(key) },
        );
        const items = Array.isArray(response) ? response : [];
        const match = items.find((item) => typeof item === "object" && item !== null && "name" in item);
        if (!match || typeof match !== "object") {
          return null;
        }
        const record = match as { name?: string; metadata?: { size?: number; mimetype?: string } };
        return Object.freeze({
          key,
          size: Number(record.metadata?.size ?? 0),
          contentType: String(record.metadata?.mimetype ?? "application/octet-stream"),
        });
      } catch (error) {
        if (error instanceof StorageObjectNotFoundError) {
          return null;
        }
        throw error;
      }
    }

    try {
      return await this.buildLocalMetadata(key);
    } catch {
      return null;
    }
  }

  async probeHealth(): Promise<StorageHealthProbeResult> {
    if (this.configuration.provider === "supabase") {
      try {
        await this.requestSupabase("GET", `/storage/v1/bucket/${this.configuration.bucket}`);
        return Object.freeze({ reachable: true, message: "Supabase Storage bucket is reachable" });
      } catch (error) {
        return Object.freeze({
          reachable: false,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }

    try {
      const root = this.resolveLocalRoot();
      await mkdir(root, { recursive: true });
      await access(root);
      return Object.freeze({ reachable: true, message: "Local storage directory is reachable" });
    } catch (error) {
      return Object.freeze({
        reachable: false,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private async uploadLocalObject(options: StorageClientUploadOptions): Promise<StorageObjectMetadata> {
    const filePath = this.resolveLocalPath(options.key);
    await mkdir(path.dirname(filePath), { recursive: true });
    const data = toBuffer(options.content);
    await writeFile(filePath, data);
    return Object.freeze({
      key: options.key,
      size: data.byteLength,
      contentType: options.contentType,
      customMetadata: options.metadata,
    });
  }

  private async downloadLocalObject(key: string): Promise<StorageObjectPayload> {
    try {
      const filePath = this.resolveLocalPath(key);
      const data = new Uint8Array(await readFile(filePath));
      const metadata = await this.buildLocalMetadata(key);
      return Object.freeze({
        key,
        data,
        contentType: metadata.contentType,
        size: metadata.size,
        lastModified: metadata.lastModified,
      });
    } catch {
      throw new StorageObjectNotFoundError(key);
    }
  }

  private async buildLocalMetadata(key: string): Promise<StorageObjectMetadata> {
    const filePath = this.resolveLocalPath(key);
    const stats = await stat(filePath);
    return Object.freeze({
      key,
      size: stats.size,
      contentType: guessContentType(key),
      lastModified: stats.mtime.toISOString(),
    });
  }

  private resolveLocalRoot(): string {
    return path.resolve(this.configuration.baseUrl, this.configuration.bucket);
  }

  private resolveLocalPath(key: string): string {
    return path.join(this.resolveLocalRoot(), normalizeKey(key));
  }

  private async uploadSupabaseObject(
    options: StorageClientUploadOptions,
  ): Promise<StorageObjectMetadata> {
    const data = toBuffer(options.content);
    await this.requestSupabase(
      "POST",
      `/storage/v1/object/${encodeObjectPath(options.key)}`,
      data,
      {
        "content-type": options.contentType,
        ...(options.overwrite ? { "x-upsert": "true" } : {}),
      },
    );

    return Object.freeze({
      key: options.key,
      size: data.byteLength,
      contentType: options.contentType,
      customMetadata: options.metadata,
    });
  }

  private async downloadSupabaseObject(key: string): Promise<StorageObjectPayload> {
    const response = await this.fetchWithTimeout(
      `${this.configuration.baseUrl}/storage/v1/object/${encodeObjectPath(key)}`,
      {
        method: "GET",
        headers: this.buildSupabaseHeaders(),
      },
    );

    if (response.status === 404) {
      throw new StorageObjectNotFoundError(key);
    }

    if (!response.ok) {
      const text = await response.text();
      throw new StorageInfrastructureError("Supabase storage download failed", response.status, text);
    }

    const buffer = new Uint8Array(await response.arrayBuffer());
    return Object.freeze({
      key,
      data: buffer,
      contentType: response.headers.get("content-type") ?? guessContentType(key),
      size: buffer.byteLength,
      etag: response.headers.get("etag") ?? undefined,
      lastModified: response.headers.get("last-modified") ?? undefined,
    });
  }

  private async requestSupabase(
    method: "GET" | "POST" | "DELETE",
    route: string,
    body?: unknown,
    extraHeaders?: Record<string, string>,
  ): Promise<unknown> {
    const url = `${this.configuration.baseUrl}${route.startsWith("/") ? route : `/${route}`}`;
    const isBinary = body instanceof Uint8Array || Buffer.isBuffer(body);

    const response = await this.fetchWithTimeout(url, {
      method,
      headers: Object.freeze({
        ...this.buildSupabaseHeaders(),
        ...(extraHeaders ?? {}),
        ...(body !== undefined && !isBinary ? { "content-type": "application/json" } : {}),
      }),
      body:
        body === undefined
          ? undefined
          : isBinary
            ? body
            : JSON.stringify(body),
    });

    if (response.status === 404) {
      throw new StorageObjectNotFoundError(route);
    }

    if (!response.ok) {
      const text = await response.text();
      throw new StorageInfrastructureError("Supabase storage request failed", response.status, text);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  private buildSupabaseHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      apikey: this.configuration.accessKey ?? "",
    };
    if (this.configuration.accessKey) {
      headers.authorization = `Bearer ${this.configuration.accessKey}`;
    }
    return headers;
  }

  private async fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.configuration.timeoutMs);
    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new StorageInfrastructureError("Storage request timed out", 408);
      }
      throw new StorageInfrastructureError(
        "Storage request failed",
        undefined,
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  private encodeObjectPath(key: string): string {
    return `${this.configuration.bucket}/${normalizeKey(key)
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/")}`;
  }
}

function normalizeKey(key: string): string {
  return key.replace(/^\/+/, "");
}

function toBuffer(content: Uint8Array | Buffer): Buffer {
  return Buffer.isBuffer(content) ? content : Buffer.from(content);
}

function guessContentType(key: string): string {
  const extension = path.extname(key).toLowerCase();
  switch (extension) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".pdf":
      return "application/pdf";
    case ".json":
      return "application/json";
    default:
      return "application/octet-stream";
  }
}

export type { IStorageClientProvider } from "@server/infrastructure/storage/client/i-storage-client-provider";
