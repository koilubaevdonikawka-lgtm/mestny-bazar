/** Executes work within a managed transactional boundary. */
export interface ITransactionManager {
  execute<T>(work: () => Promise<T>): Promise<T>;
}
