export interface ICacheKeyGenerator {
  generate(group: string, identifier: string): string;
}
