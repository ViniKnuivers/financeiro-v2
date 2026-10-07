import type { Budget } from '../domain/budget';

/** Limites mensais por categoria. */
export interface BudgetsRepository {
  list(): Promise<Budget[]>;
  set(category: string, limitCents: number): Promise<void>;
  remove(category: string): Promise<void>;
}
