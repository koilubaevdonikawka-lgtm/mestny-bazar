/** Runtime secret provider contract. */
export interface ISecretProvider {
  getSecret(name: string): string | undefined;
  getRequiredSecret(name: string): string;
  hasSecret(name: string): boolean;
}
