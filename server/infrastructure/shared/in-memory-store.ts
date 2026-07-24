/** Generic in-memory key-value store for repository implementations. */
export class InMemoryStore<T> {
  private readonly items = new Map<string, T>();

  constructor(private readonly keySelector: (value: T) => string) {}

  set(value: T): void {
    this.items.set(this.keySelector(value), value);
  }

  get(key: string): T | undefined {
    return this.items.get(key);
  }

  has(key: string): boolean {
    return this.items.has(key);
  }

  delete(key: string): boolean {
    return this.items.delete(key);
  }

  values(): T[] {
    return [...this.items.values()];
  }

  find(predicate: (value: T) => boolean): T[] {
    return this.values().filter(predicate);
  }

  clear(): void {
    this.items.clear();
  }

  snapshot(): Map<string, T> {
    return new Map(this.items);
  }

  restore(snapshot: Map<string, T>): void {
    this.items.clear();
    for (const [key, value] of snapshot) {
      this.items.set(key, value);
    }
  }
}
