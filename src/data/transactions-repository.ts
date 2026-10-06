import type { Transaction, TransactionInput } from '../domain/transaction';

/** Intervalo de datas [início, fim), "YYYY-MM-DD". */
export interface DateRange {
  start: string;
  end: string;
}

/**
 * De onde vêm e para onde vão as transações. As telas só conhecem este contrato: hoje é o
 * navegador (localStorage); com o Supabase, troca a implementação e nada mais muda.
 */
export interface TransactionsRepository {
  list(range: DateRange): Promise<Transaction[]>;
  create(input: TransactionInput): Promise<Transaction>;
  update(id: string, input: TransactionInput): Promise<Transaction>;
  remove(id: string): Promise<void>;
}

export class TransactionNotFoundError extends Error {
  constructor(id: string) {
    super(`transação ${id} não encontrada`);
    this.name = 'TransactionNotFoundError';
  }
}
