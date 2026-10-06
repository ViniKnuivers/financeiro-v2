import { createContext } from 'react';
import type { Summary } from '../domain/summary';
import type { Transaction, TransactionInput } from '../domain/transaction';
import type { TransactionsRepository } from '../data/transactions-repository';

export type LoadStatus = 'loading' | 'ready' | 'error';

export interface TransactionsContextValue {
  /** Mês na tela, "YYYY-MM". */
  month: string;
  setMonth: (month: string) => void;
  /** Todas as transações do mês, mais recentes primeiro. */
  transactions: Transaction[];
  /** As do mês que batem com a busca. */
  visible: Transaction[];
  summary: Summary;
  query: string;
  setQuery: (query: string) => void;
  status: LoadStatus;
  create: (input: TransactionInput) => Promise<void>;
  update: (id: string, input: TransactionInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
  repository: TransactionsRepository;
}

export const TransactionsContext = createContext<TransactionsContextValue | null>(null);
