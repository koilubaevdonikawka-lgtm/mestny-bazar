export interface IIdempotencyKeyGenerator {
  generate(scope?: string): string;
}
