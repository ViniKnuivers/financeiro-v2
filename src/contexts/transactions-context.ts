import { createContext } from 'react';
import type { ListFilters, Summary } from '../domain/summary';
import type { Transaction, TransactionInput } from '../domain/transaction';
import type { TransactionsRepository } from '../data/transactions-repository';

export type LoadStatus = 'loading' | 'ready' | 'error';

export interface TransactionsContextValue {
  /** Mês na tela, "YYYY-MM". */
  month: string;
  setMonth: (month: string) => void;
  /** Todas as transações do mês, mais recentes primeiro. */
  transactions: Transaction[];
  /** As do mês que passam pelos filtros, na ordem escolhida. */
  visible: Transaction[];
  summary: Summary;
  /** Resumo do mês anterior, para comparar; null enquanto carrega. */
  previousSummary: Summary | null;
  /** O mês anterior tinha algum lançamento? (sem nada, não há o que comparar) */
  previousHasData: boolean;
  filters: ListFilters;
  setFilters: (change: Partial<ListFilters>) => void;
  status: LoadStatus;
  create: (input: TransactionInput) => Promise<void>;
  update: (id: string, input: TransactionInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
  /** Devolve uma transação apagada (Desfazer). */
  restore: (transaction: Transaction) => Promise<void>;
  repository: TransactionsRepository;
}

export const TransactionsContext = createContext<TransactionsContextValue | null>(null);
