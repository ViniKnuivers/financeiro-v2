import type { Recurring, RecurringInput } from '../domain/recurring';

/** Gastos fixos. */
export interface RecurringRepository {
  /** Os ativos, em ordem de dia do mês. */
  list(): Promise<Recurring[]>;
  create(input: RecurringInput): Promise<Recurring>;
  /** Para de repetir (os lançamentos já feitos ficam). */
  stop(id: string): Promise<void>;
  /** Lança o que falta de cada fixo até o mês de `today`. Retorna quantos lançou. */
  materialize(today: string): Promise<number>;
}
