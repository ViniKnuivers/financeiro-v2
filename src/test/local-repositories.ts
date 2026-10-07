import { LocalBudgetsRepository } from '../data/local-budgets-repository';
import { LocalRecurringRepository } from '../data/local-recurring-repository';
import { LocalTransactionsRepository } from '../data/local-transactions-repository';
import { memoryStorage } from './memory-storage';

/** Os três repositórios no "navegador" em memória, como o site sem Supabase. */
export function localRepositories() {
  const storage = memoryStorage();
  const transactions = new LocalTransactionsRepository(storage);
  return {
    transactions,
    recurring: new LocalRecurringRepository(transactions, storage),
    budgets: new LocalBudgetsRepository(storage),
  };
}
