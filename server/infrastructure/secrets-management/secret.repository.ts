import type { ISecretRepository } from "@server/application/secrets-management/contracts/secret-repository.contract";
import type { StoredSecretEntry } from "@server/application/secrets-management/models/secret.model";

/** In-memory secret store. */
export class SecretRepository implements ISecretRepository {
  private readonly secrets = new Map<string, StoredSecretEntry>();

  async save(entry: StoredSecretEntry): Promise<void> {
    this.secrets.set(entry.key, entry);
  }

  async findByKey(key: string): Promise<StoredSecretEntry | null> {
    return this.secrets.get(key.trim()) ?? null;
  }

  async delete(key: string): Promise<void> {
    this.secrets.delete(key.trim());
  }

  async findAll(): Promise<readonly StoredSecretEntry[]> {
    return Object.freeze([...this.secrets.values()]);
  }

  async exists(key: string): Promise<boolean> {
    return this.secrets.has(key.trim());
  }
}
