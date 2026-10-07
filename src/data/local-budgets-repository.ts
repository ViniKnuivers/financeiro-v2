import type { Budget } from '../domain/budget';
import type { BudgetsRepository } from './budgets-repository';

const STORAGE_KEY = 'financeiro:budgets';

/** Limites por categoria no navegador. */
export class LocalBudgetsRepository implements BudgetsRepository {
  private readonly storage: Pick<Storage, 'getItem' | 'setItem'>;

  constructor(storage: Pick<Storage, 'getItem' | 'setItem'> = window.localStorage) {
    this.storage = storage;
  }

  list(): Promise<Budget[]> {
    return Promise.resolve(this.read());
  }

  set(category: string, limitCents: number): Promise<void> {
    this.write([...this.read().filter((b) => b.category !== category), { category, limitCents }]);
    return Promise.resolve();
  }

  remove(category: string): Promise<void> {
    this.write(this.read().filter((b) => b.category !== category));
    return Promise.resolve();
  }

  private read(): Budget[] {
    try {
      const parsed: unknown = JSON.parse(this.storage.getItem(STORAGE_KEY) ?? '[]');
      return Array.isArray(parsed) ? (parsed as Budget[]) : [];
    } catch {
      return [];
    }
  }

  private write(budgets: Budget[]): void {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(budgets));
  }
}
