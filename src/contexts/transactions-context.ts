import { createContext } from 'react';
import type { ListFilters, Summary } from '../domain/summary';
import type { Transaction, TransactionInput } from '../domain/transaction';
import type { Repositories } from '../data/repositories';

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
  /** Entradas − saídas de tudo até o fim do mês da tela; null se não deu para calcular. */
  accumulatedCents: number | null;
  filters: ListFilters;
  setFilters: (change: Partial<ListFilters>) => void;
  status: LoadStatus;
  /** Lança; em N parcelas (uma por mês) ou como gasto fixo, se pedido. */
  create: (input: TransactionInput, options?: CreateOptions) => Promise<void>;
  update: (id: string, input: TransactionInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
  /** Apaga todas as parcelas de uma compra; devolve as apagadas (para o Desfazer). */
  removeInstallments: (group: string) => Promise<Transaction[]>;
  /** Devolve transações apagadas (Desfazer). */
  restore: (...transactions: Transaction[]) => Promise<void>;
  /** Recarrega o mês (ex.: depois de parar um gasto fixo). */
  refresh: () => void;
  repositories: Repositories;
}

export interface CreateOptions {
  /** 2 ou mais: cria uma parcela por mês. */
  installments?: number;
  /** Vira um gasto fixo, lançado todo mês. */
  repeat?: boolean;
}

export const TransactionsContext = createContext<TransactionsContextValue | null>(null);
