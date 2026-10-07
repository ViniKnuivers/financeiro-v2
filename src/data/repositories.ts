import type { BudgetsRepository } from './budgets-repository';
import type { RecurringRepository } from './recurring-repository';
import type { TransactionsRepository } from './transactions-repository';

/** Tudo que o site guarda, num lugar só (navegador ou Supabase). */
export interface Repositories {
  transactions: TransactionsRepository;
  recurring: RecurringRepository;
  budgets: BudgetsRepository;
}
